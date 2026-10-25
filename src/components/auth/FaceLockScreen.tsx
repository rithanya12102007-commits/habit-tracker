import React, { useEffect, useRef, useState } from 'react';
import { ScanFace, KeyRound, RefreshCw } from 'lucide-react';
import { startCamera, stopCamera, readFace, isSameFace, setFaceUnlocked, cameraErrorMessage } from '../../utils/faceLock';

interface FaceLockScreenProps {
  uid: string;
  onUnlock: () => void;
  onUsePassword: () => void;
}

const MAX_TRIES = 25;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const FaceLockScreen: React.FC<FaceLockScreenProps> = ({ uid, onUnlock, onUsePassword }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState('Starting camera...');
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0); // change this number to scan again

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;

    async function scan() {
      setFailed(false);
      try {
        stream = await startCamera(videoRef.current!);
        setMessage('Loading face recognition...');

        for (let i = 0; i < MAX_TRIES && !cancelled; i++) {
          const face = await readFace(videoRef.current!);
          if (cancelled) return;
          if (face && isSameFace(uid, face)) {
            setFaceUnlocked(uid);
            onUnlock();
            return;
          }
          setMessage('Looking for your face...');
          await wait(700);
        }
        if (!cancelled) {
          setFailed(true);
          setMessage('Face not recognized.');
        }
      } catch (err) {
        if (!cancelled) {
          setFailed(true);
          setMessage(cameraErrorMessage(err));
        }
      }
    }

    scan();
    return () => {
      cancelled = true;
      stopCamera(stream);
    };
  }, [uid, attempt]);

  // Signing in with the password also counts as unlocked
  const usePassword = () => {
    setFaceUnlocked(uid);
    onUsePassword();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#090a0f] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-sm space-y-5">
        <div className="flex items-center justify-center gap-2 text-violet-400 font-semibold">
          <ScanFace className="w-5 h-5" /> Ritho AI is locked
        </div>

        <div className="relative mx-auto w-64 h-64 rounded-full overflow-hidden border-4 border-violet-500/60 bg-black">
          <video ref={videoRef} muted playsInline className="w-full h-full object-cover -scale-x-100" />
        </div>

        <p className="text-sm text-neutral-300">{message}</p>

        <div className="flex flex-col gap-2">
          {failed && (
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Try again
            </button>
          )}
          <button
            type="button"
            onClick={usePassword}
            className="px-4 py-2.5 rounded-xl bg-[#181a29] hover:bg-[#1f2233] border border-neutral-800 text-neutral-200 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" /> Use password instead
          </button>
        </div>
      </div>
    </div>
  );
};
