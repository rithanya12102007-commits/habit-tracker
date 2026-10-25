import React, { useEffect, useRef, useState } from 'react';
import { ScanFace, CheckCircle2, Trash2, Lock, Camera, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  hasSavedFace,
  saveFace,
  removeFace,
  readFace,
  startCamera,
  stopCamera,
  setFaceUnlocked,
  cameraErrorMessage,
  isSameFace,
} from '../../utils/faceLock';

const SAMPLES_NEEDED = 3;
const MAX_TRIES = 25;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const FaceUnlockSettings: React.FC = () => {
  const { user } = useAuth();
  const uid = user?.uid || '';

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [enabled, setEnabled] = useState(() => hasSavedFace(uid));
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [capturedCount, setCapturedCount] = useState(0);

  // Turn the camera off when leaving this screen
  useEffect(() => {
    return () => stopCamera(streamRef.current);
  }, []);

  const setup = async () => {
    setScanning(true);
    setCapturedCount(0);
    setMessage('Starting camera...');
    try {
      streamRef.current = await startCamera(videoRef.current!);
      setMessage('Look straight at the camera...');

      const samples: number[][] = [];
      for (let i = 0; i < MAX_TRIES && samples.length < SAMPLES_NEEDED; i++) {
        const face = await readFace(videoRef.current!);
        if (face) {
          samples.push(face);
          setCapturedCount(samples.length);
          setMessage(`Captured ${samples.length} of ${SAMPLES_NEEDED}. Keep still, slightly move your head...`);
        }
        await wait(900);
      }

      if (samples.length < SAMPLES_NEEDED) {
        setMessage('Could not see your face clearly. Please try again in better light.');
      } else {
        saveFace(uid, samples);
        setFaceUnlocked(uid);
        setEnabled(true);
        setMessage('Face enrolled successfully! Your app can now be unlocked with your face.');
      }
    } catch (err) {
      setMessage(cameraErrorMessage(err));
    } finally {
      stopCamera(streamRef.current);
      streamRef.current = null;
      setScanning(false);
    }
  };

  const testVerification = async () => {
    setVerifying(true);
    setVerifyResult(null);
    setMessage('Starting camera to verify your face...');
    try {
      streamRef.current = await startCamera(videoRef.current!);
      setMessage('Looking for your face...');

      let matched = false;
      for (let i = 0; i < 15; i++) {
        const face = await readFace(videoRef.current!);
        if (face && isSameFace(uid, face)) {
          matched = true;
          setVerifyResult('Face verified successfully! High-confidence match.');
          break;
        }
        await wait(600);
      }

      if (!matched) {
        setVerifyResult('Face not recognized. Try again facing the camera with good lighting.');
      }
    } catch (err) {
      setMessage(cameraErrorMessage(err));
    } finally {
      stopCamera(streamRef.current);
      streamRef.current = null;
      setVerifying(false);
    }
  };

  const turnOff = () => {
    removeFace(uid);
    setEnabled(false);
    setMessage('Face Unlock has been turned off and biometric descriptors deleted.');
    setVerifyResult(null);
  };

  const lockAppNow = () => {
    try {
      sessionStorage.removeItem(`ritho_face_unlocked_${uid}`);
    } catch {
      // ignore
    }
    window.location.reload();
  };

  return (
    <div className="p-6 rounded-2xl bg-[#121422] border border-neutral-800 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <ScanFace className="w-4 h-4 text-violet-400" />
          <span>Face Unlock (Biometric Security)</span>
        </h2>
        {enabled && (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Active on this device
          </span>
        )}
      </div>

      <p className="text-xs text-neutral-400 leading-relaxed">
        Lock Ritho AI on this device and unlock it automatically with your face using on-device neural descriptors.
        Your facial data is converted into local numeric embeddings stored <strong>only on this device</strong>.
        No photos or biometric data are ever sent to the cloud.
      </p>

      {/* Camera preview during enrollment or verification */}
      <div className={scanning || verifying ? 'block' : 'hidden'}>
        <div className="relative mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-violet-500/60 bg-black shadow-xl shadow-violet-600/20">
          <video ref={videoRef} muted playsInline className="w-full h-full object-cover -scale-x-100" />
          <div className="absolute inset-0 border-2 border-violet-400/40 rounded-full animate-pulse pointer-events-none" />
        </div>
        {scanning && (
          <div className="flex justify-center gap-2 mt-3">
            {[1, 2, 3].map((step) => (
              <span
                key={step}
                className={`w-3 h-3 rounded-full transition-colors ${
                  capturedCount >= step ? 'bg-violet-400' : 'bg-neutral-800 border border-neutral-700'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {message && <p className="text-xs text-neutral-300 font-medium">{message}</p>}
      {verifyResult && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            verifyResult.includes('successfully')
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{verifyResult}</span>
        </div>
      )}

      {enabled ? (
        <div className="flex items-center gap-2.5 flex-wrap pt-1">
          <button
            type="button"
            onClick={lockAppNow}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-violet-600/20 transition-all"
          >
            <Lock className="w-3.5 h-3.5" /> Lock App Now (Test Face Screen)
          </button>
          <button
            type="button"
            onClick={testVerification}
            disabled={verifying || scanning}
            className="px-3.5 py-2 rounded-xl bg-[#181a29] hover:bg-[#1f2233] border border-neutral-800 text-xs font-semibold text-neutral-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Camera className="w-3.5 h-3.5 text-violet-400" />
            <span>{verifying ? 'Verifying...' : 'Test Face Scan'}</span>
          </button>
          <button
            type="button"
            onClick={turnOff}
            className="px-3 py-2 rounded-xl bg-[#181a29] hover:bg-red-950/40 border border-neutral-800 hover:border-red-500/30 text-xs font-semibold text-neutral-300 hover:text-red-300 flex items-center gap-1.5 ml-auto transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" /> Turn Off & Delete Face
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={setup}
            disabled={scanning || verifying}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-violet-600/25 transition-all"
          >
            <ScanFace className="w-4 h-4" />
            <span>{scanning ? 'Enrolling Face...' : 'Set Up Face Unlock'}</span>
          </button>
          <span className="text-[11px] text-neutral-400">Takes ~10 seconds with web camera</span>
        </div>
      )}
    </div>
  );
};
