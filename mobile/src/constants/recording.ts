import { IOSOutputFormat, type RecordingOptions } from 'expo-audio';
import { Platform } from 'react-native';

/** 16 kHz mono preset. iOS records PCM WAV; Android records AMR-WB. */
export const PITCH_AUDIO_PRESET: RecordingOptions = {
  extension: Platform.OS === 'ios' ? '.wav' : '.3gp',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 128000,
  android: {
    extension: '.3gp',
    outputFormat: 'amrwb',
    audioEncoder: 'amr_wb',
    sampleRate: 16000,
  },
  ios: {
    extension: '.wav',
    outputFormat: IOSOutputFormat.LINEARPCM,
    sampleRate: 16000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
    audioQuality: 127,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

export function getPitchAudioMimeType(): string {
  if (Platform.OS === 'ios') return 'audio/pcm;rate=16000';
  if (Platform.OS === 'android') return 'audio/amr-wb;rate=16000';
  return 'audio/webm';
}
