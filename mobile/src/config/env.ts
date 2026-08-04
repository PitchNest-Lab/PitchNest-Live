const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://pitchnest-live.onrender.com';
const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'wss://pitchnest-live.onrender.com';

export const env = {
  apiUrl: API_URL.replace(/\/$/, ''),
  wsUrl: WS_URL.replace(/\/$/, ''),
};

export function apiPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${env.apiUrl}${normalized}`;
}

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${env.apiUrl}${url.startsWith('/') ? url : `/${url}`}`;
}
