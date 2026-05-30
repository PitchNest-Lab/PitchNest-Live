import * as FileSystem from 'expo-file-system';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import ViewShot from 'react-native-view-shot';
import { resolveMediaUrl } from '../config/env';
import { colors, radius } from '../constants/theme';

export type DeckSlideViewerRef = {
  captureSlide: () => Promise<string | null>;
  nextSlide: () => void;
  prevSlide: () => void;
};

type Props = {
  fileUrl: string;
  onSlideChange?: (index: number) => void;
};

export const DeckSlideViewer = forwardRef<DeckSlideViewerRef, Props>(function DeckSlideViewer(
  { fileUrl, onSlideChange },
  ref
) {
  const shotRef = useRef<React.ElementRef<typeof ViewShot>>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const resolved = resolveMediaUrl(fileUrl);
  const pdfUri = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(resolved)}`;

  useImperativeHandle(ref, () => ({
    async captureSlide() {
      try {
        const uri = await shotRef.current?.capture?.();
        if (!uri) return null;
        return await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      } catch {
        return null;
      }
    },
    nextSlide() {
      setPage((p) => {
        const next = p + 1;
        onSlideChange?.(next);
        return next;
      });
    },
    prevSlide() {
      setPage((p) => {
        const next = Math.max(1, p - 1);
        onSlideChange?.(next);
        return next;
      });
    },
  }));

  return (
    <View style={styles.wrap}>
      <ViewShot ref={shotRef} style={styles.shot} options={{ format: 'jpg', quality: 0.5 }}>
        <WebView
          source={{ uri: pdfUri }}
          style={styles.webview}
          onLoadEnd={() => setLoading(false)}
          scrollEnabled
          originWhitelist={['*']}
        />
      </ViewShot>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}
      <Text style={styles.pageLabel}>Slide {page}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    height: 220,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: colors.border,
  },
  shot: { flex: 1 },
  webview: { flex: 1, backgroundColor: '#fff' },
  loader: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.35)',
  },
  pageLabel: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '700',
  },
});
