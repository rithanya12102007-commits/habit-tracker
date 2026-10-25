import { GoogleGenAI, Modality } from '@google/genai';
import { auth } from '../lib/firebase';
import { downsample, floatToPcm16Base64, base64ToFloat32 } from './pcmAudio';

export type LiveStatus = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';

export interface LiveCallbacks {
  onStatus: (status: LiveStatus, message?: string) => void;
  onUserText: (text: string) => void; // a piece of what the user said
  onAiText: (text: string) => void; // a piece of what the AI said
  onTurnComplete: () => void;
}

const INPUT_RATE = 16000; // microphone audio sent to Gemini
const OUTPUT_RATE = 24000; // audio coming back from Gemini

// One live voice call with the Gemini Live API
export class LiveVoiceSession {
  private session: any = null;
  private micStream: MediaStream | null = null;
  private micContext: AudioContext | null = null;
  private micProcessor: ScriptProcessorNode | null = null;
  private playContext: AudioContext | null = null;
  private nextPlayTime = 0;
  private playingSources: AudioBufferSourceNode[] = [];
  private closed = false;

  constructor(private callbacks: LiveCallbacks) {}

  async start(systemInstruction: string, greeting: string) {
    this.closed = false;
    this.callbacks.onStatus('connecting');

    try {
      // 1. Ask our server for a short-lived key
      const headers: Record<string, string> = {};
      const idToken = await auth.currentUser?.getIdToken().catch(() => null);
      if (idToken) {
        headers.Authorization = `Bearer ${idToken}`;
      }

      const res = await fetch('/api/live/token', {
        method: 'POST',
        headers,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not start live voice. Please try again.');
      }
      const { token, model } = await res.json();

      // 2. Ask for the microphone
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });

      // 3. Connect to Gemini Live
      const ai = new GoogleGenAI({ apiKey: token });
      this.playContext = new AudioContext({ sampleRate: OUTPUT_RATE });

      this.session = await ai.live.connect({
        model,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {},
          onmessage: (message: any) => this.handleMessage(message),
          onerror: (e: any) => this.fail(e?.message || 'Live voice connection error.'),
          onclose: () => {
            if (!this.closed) {
              this.cleanup();
              this.callbacks.onStatus('idle');
            }
          },
        },
      });

      // 4. Start sending the microphone and let the coach say hello
      this.startMicrophone();
      this.callbacks.onStatus('listening');
      this.session.sendRealtimeInput({ text: greeting });
    } catch (err: any) {
      const denied = err?.name === 'NotAllowedError';
      this.fail(denied ? 'Microphone permission was blocked. Please allow it and try again.' : err?.message || 'Could not start live voice.');
    }
  }

  stop() {
    this.cleanup();
    this.callbacks.onStatus('idle');
  }

  // ---------- Microphone -> Gemini ----------
  private startMicrophone() {
    if (!this.micStream) return;
    this.micContext = new AudioContext();
    const source = this.micContext.createMediaStreamSource(this.micStream);
    // ScriptProcessor is old but simple and works in all browsers
    this.micProcessor = this.micContext.createScriptProcessor(4096, 1, 1);

    this.micProcessor.onaudioprocess = (event) => {
      if (!this.session || this.closed) return;
      const input = event.inputBuffer.getChannelData(0);
      const samples = downsample(input, event.inputBuffer.sampleRate, INPUT_RATE);
      this.session.sendRealtimeInput({
        audio: { data: floatToPcm16Base64(samples), mimeType: `audio/pcm;rate=${INPUT_RATE}` },
      });
    };

    source.connect(this.micProcessor);
    this.micProcessor.connect(this.micContext.destination);
  }

  // ---------- Gemini -> speaker ----------
  private handleMessage(message: any) {
    const content = message?.serverContent;
    if (!content) return;

    // The user started talking while the AI was talking: stop the AI voice
    if (content.interrupted) {
      this.stopPlayback();
      this.callbacks.onStatus('listening');
    }

    if (content.inputTranscription?.text) this.callbacks.onUserText(content.inputTranscription.text);
    if (content.outputTranscription?.text) this.callbacks.onAiText(content.outputTranscription.text);

    for (const part of content.modelTurn?.parts || []) {
      if (part.inlineData?.data) this.playAudio(part.inlineData.data);
    }

    if (content.turnComplete) this.callbacks.onTurnComplete();
  }

  private playAudio(base64: string) {
    const context = this.playContext;
    if (!context || this.closed) return;

    const samples = base64ToFloat32(base64);
    const buffer = context.createBuffer(1, samples.length, OUTPUT_RATE);
    buffer.getChannelData(0).set(samples);

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);

    // Play chunks one after another without gaps
    const startAt = Math.max(context.currentTime, this.nextPlayTime);
    source.start(startAt);
    this.nextPlayTime = startAt + buffer.duration;

    this.playingSources.push(source);
    this.callbacks.onStatus('speaking');

    source.onended = () => {
      this.playingSources = this.playingSources.filter((s) => s !== source);
      if (this.playingSources.length === 0 && !this.closed) {
        this.callbacks.onStatus('listening');
      }
    };
  }

  private stopPlayback() {
    for (const source of this.playingSources) {
      try {
        source.stop();
      } catch {
        // already stopped
      }
    }
    this.playingSources = [];
    this.nextPlayTime = 0;
  }

  // ---------- Close everything ----------
  private fail(message: string) {
    this.cleanup();
    this.callbacks.onStatus('error', message);
  }

  private cleanup() {
    this.closed = true;
    this.stopPlayback();
    try {
      this.micProcessor?.disconnect();
    } catch {
      // ignore
    }
    this.micStream?.getTracks().forEach((track) => track.stop());
    this.micContext?.close().catch(() => {});
    this.playContext?.close().catch(() => {});
    try {
      this.session?.close();
    } catch {
      // ignore
    }
    this.session = null;
    this.micProcessor = null;
    this.micStream = null;
    this.micContext = null;
    this.playContext = null;
  }
}
