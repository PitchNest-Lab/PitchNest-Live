import { IOSOutputFormat, type RecordingOptions } from 'expo-audio';
import { Platform } from 'react-native';

/** 16 kHz mono PCM-friendly preset for Gemini Live (iOS WAV; Android AMR-WB). */
export const PITCH_AUDIO_PRESET: RecordingOptions =
  Platform.OS === 'ios'
    ? {
        extension: '.wav',
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 256000,
        ios: {
          extension: '.wav',
          outputFormat: IOSOutputFormat.LINEARPCM,
          sampleRate: 16000,
          numberOfChannels: 1,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
          audioQuality: 127,
        },
      }
    : {
        extension: '.3gp',
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
        android: {
          extension: '.3gp',
          outputFormat: 'amrwb',
          audioEncoder: 'amrwb',
          sampleRate: 16000,
          numberOfChannels: 1,
        },
      };

export function getPitchAudioMimeType(): string {
  return Platform.OS === 'ios' ? 'audio/pcm;rate=16000' : 'audio/amr-wb;rate=16000';
}
