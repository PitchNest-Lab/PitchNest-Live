import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import {
  AudioModule,
  RecordingPresets,
  createAudioPlayer,
  setAudioModeAsync,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRootNavigation } from '../hooks/useRootNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { DeckSlideViewer, DeckSlideViewerRef } from '../components/DeckSlideViewer';
import { env } from '../config/env';
import { colors, radius, spacing } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { usePitchConfig } from '../contexts/PitchContext';
import { formatTime, getPersonas, pcm16ToWavBase64 } from '../lib/utils';
import type { LiveScores, TranscriptEntry } from '../types';
import type { PitchStackParamList } from '../navigation/PitchStack';

export default function LiveRoomScreen() {
  const { user } = useAuth();
  const { pitchConfig } = usePitchConfig();
  const navigation = useNavigation<NativeStackNavigationProp<PitchStackParamList>>();
  const { navigateRoot } = useRootNavigation();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const [roomState, setRoomState] = useState<'waiting' | 'countdown' | 'live'>('waiting');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [messages, setMessages] = useState<TranscriptEntry[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState('');
  const [scores, setScores] = useState<LiveScores>({
    clarity: null,
    confidence: null,
    marketFit: null,
    readiness: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const deckRef = useRef<DeckSlideViewerRef>(null);
  const soundQueueRef = useRef<Promise<void>>(Promise.resolve());
  const pitchStartRef = useRef(0);
  const hasSentReadyRef = useRef(false);
  const endSessionRef = useRef<() => void>(() => {});

  const personas = getPersonas(pitchConfig?.investorArchetype || '', pitchConfig?.mode || 'panel');

  useEffect(() => {
    if (!pitchConfig) {
      Alert.alert('Missing setup', 'Configure your pitch first.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [pitchConfig, navigation]);

  const playPcmAudio = useCallback(async (base64Pcm: string) => {
    soundQueueRef.current = soundQueueRef.current.then(async () => {
      try {
        const wavBase64 = pcm16ToWavBase64(base64Pcm, 24000);
        const player = createAudioPlayer({ uri: `data:audio/wav;base64,${wavBase64}` });
        await new Promise<void>((resolve) => {
          const sub = player.addListener('playbackStatusUpdate', (status) => {
            if (status.didJustFinish) {
              sub.remove();
              player.remove();
              resolve();
            }
          });
          player.play();
        });
      } catch {
        // ignore playback errors
      }
    });
  }, []);

  const connectSocket = useCallback(() => {
    const ws = new WebSocket(env.wsUrl);
    wsRef.current = ws;
    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        if (data.type === 'transcript' && data.text) {
          setActiveSpeaker(data.speaker || '');
          setMessages((prev) => [
            ...prev,
            { id: `${Date.now()}`, text: data.text, type: 'ai', speaker: data.speaker },
          ]);
        }
        if (data.type === 'audio' && data.data) playPcmAudio(data.data);
        if (data.type === 'SCORE_UPDATE' && data.scores) setScores(data.scores);
        if (data.type === 'idle_end') {
          setMessages((prev) => [
            ...prev,
            { id: `idle-${Date.now()}`, text: data.message || 'Session ended due to inactivity.', type: 'ai', speaker: 'System' },
          ]);
          setTimeout(() => endSessionRef.current(), 1500);
        }
        if (data.type === 'report') {
          setIsEvaluating(false);
          navigateRoot('Report', { sessionId: data.sessionId });
        }
        if (data.type === 'error') {
          Alert.alert('Connection error', data.message || 'AI service unavailable');
        }
      } catch {
        // ignore parse errors
      }
    };
    return ws;
  }, [navigateRoot, playPcmAudio]);

  useEffect(() => {
    const ws = connectSocket();
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close();
    };
  }, [connectSocket]);

  useEffect(() => {
    if (roomState !== 'countdown') return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
    setRoomState('live');
    pitchStartRef.current = Date.now();
  }, [roomState, countdown]);

  const endSession = useCallback(() => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    const duration = Math.floor((Date.now() - pitchStartRef.current) / 1000);
    wsRef.current?.send(
      JSON.stringify({
        type: 'end_session',
        duration,
        transcript: messages,
      })
    );
  }, [isEvaluating, messages]);

  useEffect(() => {
    endSessionRef.current = endSession;
  }, [endSession]);

  useEffect(() => {
    if (roomState !== 'live') return;
    if (timeLeft <= 0) {
      endSession();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [roomState, timeLeft, endSession]);

  useEffect(() => {
    if (roomState !== 'live' || !isConnected || !wsRef.current || hasSentReadyRef.current || !pitchConfig) return;
    wsRef.current.send(
      JSON.stringify({
        type: 'client_ready',
        config: { ...pitchConfig, userId: user?.id, screenShareEnabled: false },
      })
    );
    hasSentReadyRef.current = true;
  }, [roomState, isConnected, pitchConfig, user?.id]);

  useEffect(() => {
    if (roomState !== 'live' || !wsRef.current) return;

    const visionInterval = setInterval(async () => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      const frames: Array<{ mimeType: string; data: string }> = [];

      if (pitchConfig?.cameraEnabled && cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.35, skipProcessing: true });
          if (photo?.base64) frames.push({ mimeType: 'image/jpeg', data: photo.base64 });
        } catch {
          // ignore camera capture errors
        }
      }

      if (pitchConfig?.selectedDeck?.file_url && deckRef.current) {
        const slide = await deckRef.current.captureSlide();
        if (slide) frames.push({ mimeType: 'image/jpeg', data: slide });
      }

      if (frames.length > 0) {
        ws.send(JSON.stringify({ realtimeInput: { mediaChunks: frames } }));
      }
    }, 4000);

    return () => clearInterval(visionInterval);
  }, [roomState, pitchConfig]);

  useEffect(() => {
    if (roomState !== 'live' || isMicMuted || !pitchConfig?.micEnabled) return;

    let active = true;
    (async () => {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      const loop = async () => {
        const recorder = new AudioModule.AudioRecorder(RecordingPresets.LOW_QUALITY);
        while (active && !isMicMuted) {
          try {
            recorder.record();
            await new Promise((r) => setTimeout(r, 400));
            await recorder.stop();
            const uri = recorder.uri;
            if (uri && wsRef.current?.readyState === WebSocket.OPEN) {
              const base64Data = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
              wsRef.current.send(
                JSON.stringify({
                  realtimeInput: {
                    mediaChunks: [{ mimeType: 'audio/mp4', data: base64Data }],
                  },
                })
              );
            }
          } catch {
            await new Promise((r) => setTimeout(r, 500));
          }
        }
        recorder.stop().catch(() => {});
      };
      loop();
    })();

    return () => {
      active = false;
    };
  }, [roomState, isMicMuted, pitchConfig?.micEnabled]);

  const startSession = async () => {
    if (pitchConfig?.micEnabled && !micPermission?.granted) {
      const mic = await requestMicPermission();
      if (!mic?.granted) {
        Alert.alert('Microphone required', 'Allow microphone access to start your pitch.');
        return;
      }
    }
    if (pitchConfig?.cameraEnabled && !cameraPermission?.granted) {
      const cam = await requestCameraPermission();
      if (!cam?.granted) {
        Alert.alert(
          'Camera optional',
          'Camera was denied. You can still pitch with voice and deck slides.',
          [{ text: 'Continue', onPress: () => setRoomState('countdown') }]
        );
        return;
      }
    }
    if (!isConnected) {
      Alert.alert('Connecting…', 'Still connecting to the AI server. Wait a moment and try again.');
      return;
    }
    setRoomState('countdown');
  };

  const sendChat = () => {
    if (!chatInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, text: chatInput.trim(), type: 'user', speaker: user?.name, inputMethod: 'chat' },
    ]);
    wsRef.current.send(JSON.stringify({ type: 'chat_message', text: chatInput.trim() }));
    setChatInput('');
  };

  if (!pitchConfig) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Pitch</Text>
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
        <Text style={[styles.status, isConnected && styles.statusLive]}>
          {isConnected ? 'Live' : 'Connecting…'}
        </Text>
      </View>

      {roomState === 'waiting' && (
        <View style={styles.centerBox}>
          <Text style={styles.readyTitle}>Ready when you are</Text>
          <Text style={styles.readyText}>
            AI panel feedback · deck slides · voice. Keep the app in the foreground.
          </Text>
          <Button title="Start countdown" onPress={startSession} />
        </View>
      )}

      {roomState === 'countdown' && (
        <View style={styles.centerBox}>
          <Text style={styles.countdown}>{countdown}</Text>
        </View>
      )}

      {roomState === 'live' && (
        <>
          {pitchConfig.selectedDeck?.file_url ? (
            <DeckSlideViewer ref={deckRef} fileUrl={pitchConfig.selectedDeck.file_url} />
          ) : null}

          {pitchConfig.cameraEnabled ? (
            <View style={styles.cameraWrap}>
              <CameraView ref={cameraRef} style={styles.camera} facing="front" mode="picture" />
            </View>
          ) : null}

          <View style={styles.panelRow}>
            {personas.slice(0, 3).map((p) => (
              <View key={p.name} style={[styles.panelist, activeSpeaker.includes(p.name) && styles.panelistActive]}>
                <Text style={styles.panelName}>{p.name}</Text>
                <Text style={styles.panelRole}>{p.role}</Text>
              </View>
            ))}
          </View>

          <View style={styles.scoreRow}>
            {(['clarity', 'confidence', 'marketFit', 'readiness'] as const).map((key) => (
              <View key={key} style={styles.scoreChip}>
                <Text style={styles.scoreKey}>{key}</Text>
                <Text style={styles.scoreVal}>{scores[key] ?? '—'}</Text>
              </View>
            ))}
          </View>

          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            style={styles.chatList}
            contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
            renderItem={({ item }) => (
              <View style={[styles.bubble, item.type === 'user' ? styles.userBubble : styles.aiBubble]}>
                {item.speaker ? <Text style={styles.speaker}>{item.speaker}</Text> : null}
                <Text style={styles.bubbleText}>{item.text}</Text>
              </View>
            )}
          />

          <View style={styles.controls}>
            <Pressable style={styles.controlBtn} onPress={() => setIsMicMuted((v) => !v)}>
              <Text style={styles.controlText}>{isMicMuted ? 'Mic off' : 'Mic on'}</Text>
            </Pressable>
            <TextInput
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Message the panel…"
              style={styles.input}
              placeholderTextColor={colors.textMuted}
            />
            <Pressable style={styles.controlBtn} onPress={sendChat}>
              <Text style={styles.controlText}>Send</Text>
            </Pressable>
          </View>

          <Button
            title={isEvaluating ? 'Evaluating…' : 'End session'}
            variant="danger"
            onPress={endSession}
            loading={isEvaluating}
          />
        </>
      )}

      {isEvaluating && (
        <View style={styles.evalOverlay}>
          <ActivityIndicator color="#fff" size="large" />
          <Text style={styles.evalText}>Panel is grading your pitch…</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.roomBg, padding: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { color: '#fff', fontWeight: '800', fontSize: 18 },
  timer: { color: '#38bdf8', fontWeight: '800' },
  status: { color: colors.roomMuted, fontSize: 12, fontWeight: '700' },
  statusLive: { color: colors.accent },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.lg },
  readyTitle: { color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  readyText: { color: '#94a3b8', textAlign: 'center', lineHeight: 22 },
  countdown: { color: '#fff', fontSize: 96, fontWeight: '900' },
  cameraWrap: { height: 120, borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.sm },
  camera: { flex: 1 },
  panelRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.sm },
  panelist: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: radius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  panelistActive: { borderColor: colors.primary, backgroundColor: '#0c4a6e' },
  panelName: { color: '#fff', fontWeight: '800', fontSize: 12 },
  panelRole: { color: '#94a3b8', fontSize: 10, marginTop: 2 },
  scoreRow: { flexDirection: 'row', gap: 6, marginBottom: spacing.sm },
  scoreChip: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 6,
    alignItems: 'center',
  },
  scoreKey: { color: '#94a3b8', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  scoreVal: { color: '#fff', fontWeight: '800' },
  chatList: { flex: 1, marginBottom: spacing.sm },
  bubble: { borderRadius: radius.lg, padding: 10, maxWidth: '92%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#1e293b' },
  speaker: { color: '#bae6fd', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  bubbleText: { color: '#fff', lineHeight: 20 },
  controls: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: spacing.sm },
  controlBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  controlText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  evalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15,23,42,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  evalText: { color: '#fff', fontWeight: '700' },
});
