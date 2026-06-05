import { apiPath } from '../config/env';
import type { EvaluationReport } from '../types';

export function getOverallScore(report?: EvaluationReport | { scores?: Record<string, number> } | null): number {
  if (!report?.scores) return 0;
  const s = report.scores;
  const total =
    (Number(s.delivery) || 0) +
    (Number(s.clarity) || 0) +
    (Number(s.scalability) || 0) +
    (Number(s.readiness) || 0);
  if (total === 0) return 0;
  return Math.round((total / 40) * 100);
}

export function getSessionStatus(score: number): string {
  if (score === 0) return 'Incomplete';
  if (score >= 80) return 'Investor Ready';
  if (score >= 60) return 'Good Progress';
  return 'Needs Work';
}

export function formatDate(timestamp?: string): string {
  if (!timestamp) return 'Unknown';
  try {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Unknown';
  }
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function getPersonas(archetype: string, mode: string) {
  if (mode === 'coach') {
    return [
      { name: 'Riley', role: 'Pitch Strategist' },
      { name: 'Taylor', role: 'Comm. Expert' },
    ];
  }
  if (archetype === 'Angel Investor Group') {
    return [
      { name: 'Elena', role: 'Lead Angel' },
      { name: 'David', role: 'Industry Vet' },
      { name: 'James', role: 'Financial Advisor' },
    ];
  }
  return [
    { name: 'Marcus', role: 'The Skeptic' },
    { name: 'Sarah', role: 'The Analyst' },
    { name: 'Chen', role: 'Tech Expert' },
  ];
}

export async function parseJsonResponse(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }
  return data;
}

export async function uploadDeck(token: string, uri: string, name: string, mimeType: string) {
  const formData = new FormData();
  formData.append('deck', {
    uri,
    name,
    type: mimeType,
  } as unknown as Blob);

  const res = await fetch(apiPath('/api/upload-deck'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return parseJsonResponse(res);
}

/** Strip a standard 44-byte WAV header and return raw PCM base64 for Gemini Live. */
export function wavBase64ToPcmBase64(wavBase64: string): string | null {
  try {
    const bytes = base64ToBytes(wavBase64);
    if (bytes.length <= 44) return null;
    if (bytes[0] !== 0x52 || bytes[1] !== 0x49 || bytes[2] !== 0x46 || bytes[3] !== 0x46) {
      return null;
    }
    return bytesToBase64(bytes.subarray(44));
  } catch {
    return null;
  }
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  }
  // @ts-expect-error global in RN
  if (global.Buffer) {
    // @ts-expect-error global in RN
    return global.Buffer.from(bytes).toString('base64');
  }
  throw new Error('Base64 encoding unavailable');
}

export function base64ToBytes(base64: string): Uint8Array {
  if (typeof atob !== 'undefined') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  // @ts-expect-error global in RN
  if (global.Buffer) {
    // @ts-expect-error global in RN
    return new Uint8Array(global.Buffer.from(base64, 'base64'));
  }
  throw new Error('Base64 decoding unavailable');
}

export function pcm16ToWavBase64(pcmBase64: string, sampleRate = 24000): string {
  const pcmBytes = base64ToBytes(pcmBase64);
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i += 1) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcmBytes.length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, pcmBytes.length, true);

  const wav = new Uint8Array(44 + pcmBytes.length);
  wav.set(new Uint8Array(header), 0);
  wav.set(pcmBytes, 44);
  return bytesToBase64(wav);
}
