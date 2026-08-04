import { IOSOutputFormat, type RecordingOptions } from 'expo-audio';
import { Platform } from 'react-native';

const androidPreset = {
  extension: '.3gp',
  outputFormat: 'amrwb' as const,
  audioEncoder: 'amr_wb' as const,
  sampleRate: 16000,
  numberOfChannels: 1,
};

const iosPreset = {
  extension: '.wav',
  outputFormat: IOSOutputFormat.LINEARPCM,
  sampleRate: 16000,
  numberOfChannels: 1,
  linearPCMBitDepth: 16,
  linearPCMIsBigEndian: false,
  linearPCMIsFloat: false,
  audioQuality: 127,
};

/** 16 kHz mono PCM preset for Azure Speech STT (iOS WAV; Android AMR-WB fallback). */
export const PITCH_AUDIO_PRESET: RecordingOptions = {
  extension: Platform.OS === 'ios' ? '.wav' : '.3gp',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: Platform.OS === 'ios' ? 256000 : 128000,
  ios: iosPreset,
  android: androidPreset,
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

export function getPitchAudioMimeType(): string {
  return Platform.OS === 'ios' ? 'audio/pcm;rate=16000' : 'audio/amr-wb;rate=16000';
}
