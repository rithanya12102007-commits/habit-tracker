// Face Unlock: the face is turned into 128 numbers and stored ONLY on this device (localStorage).
// No photo and no face data is ever uploaded.

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model/';
const MATCH_DISTANCE = 0.5; // smaller = stricter (0.6 is the usual default)

let faceApiPromise: Promise<any> | null = null;

// Loads the face library and its models the first time they are needed
async function getFaceApi() {
  if (!faceApiPromise) {
    faceApiPromise = (async () => {
      const faceapi = await import('@vladmandic/face-api');
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      return faceapi;
    })().catch((err) => {
      faceApiPromise = null; // allow retry
      throw err;
    });
  }
  return faceApiPromise;
}

// ---------- Camera ----------
export async function startCamera(video: HTMLVideoElement): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: 480, height: 360 },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();
  return stream;
}

export function stopCamera(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

// ---------- Read a face from the video (returns 128 numbers, or null if no face) ----------
export async function readFace(video: HTMLVideoElement): Promise<number[] | null> {
  const faceapi = await getFaceApi();
  const result = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
  return result ? Array.from(result.descriptor as Float32Array) : null;
}

// ---------- Saved face (per user, per device) ----------
const faceKey = (uid: string) => `ritho_face_${uid}`;
const unlockedKey = (uid: string) => `ritho_face_unlocked_${uid}`;

export function hasSavedFace(uid: string): boolean {
  try {
    return !!localStorage.getItem(faceKey(uid));
  } catch {
    return false;
  }
}

// Saves the average of several samples
export function saveFace(uid: string, samples: number[][]) {
  const average = samples[0].map((_, i) => samples.reduce((sum, s) => sum + s[i], 0) / samples.length);
  localStorage.setItem(faceKey(uid), JSON.stringify(average));
}

export function removeFace(uid: string) {
  localStorage.removeItem(faceKey(uid));
  sessionStorage.removeItem(unlockedKey(uid));
}

function distance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

export function isSameFace(uid: string, face: number[]): boolean {
  try {
    const saved: number[] = JSON.parse(localStorage.getItem(faceKey(uid)) || 'null');
    return !!saved && saved.length === face.length && distance(saved, face) < MATCH_DISTANCE;
  } catch {
    return false;
  }
}

// ---------- "Unlocked in this browser tab" flag ----------
export function isFaceUnlocked(uid: string): boolean {
  try {
    return sessionStorage.getItem(unlockedKey(uid)) === '1';
  } catch {
    return false;
  }
}

export function setFaceUnlocked(uid: string) {
  try {
    sessionStorage.setItem(unlockedKey(uid), '1');
  } catch {
    // ignore
  }
}

export function cameraErrorMessage(err: any): string {
  if (err?.name === 'NotAllowedError') return 'Camera permission was blocked. Please allow the camera and try again.';
  if (err?.name === 'NotFoundError') return 'No camera was found on this device.';
  return 'Could not start face recognition. Please try again.';
}
