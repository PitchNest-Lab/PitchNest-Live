import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../constants/theme';

type TabName = 'Home' | 'Pitch' | 'Decks' | 'History' | 'Profile';

type Props = { name: TabName; focused: boolean };

export function TabIcon({ name, focused }: Props) {
  const color = focused ? colors.primary : colors.textMuted;
  const fill = focused ? colors.primary : 'transparent';

  switch (name) {
    case 'Home':
      return (
        <View style={styles.wrap}>
          <View style={[styles.roof, { borderBottomColor: color }]} />
          <View style={[styles.homeBody, { backgroundColor: fill, borderColor: color }]} />
        </View>
      );
    case 'Pitch':
      return (
        <View style={styles.wrap}>
          <View style={[styles.micHead, { backgroundColor: fill, borderColor: color }]} />
          <View style={[styles.micStem, { backgroundColor: color }]} />
          <View style={[styles.micBase, { backgroundColor: color }]} />
        </View>
      );
    case 'Decks':
      return (
        <View style={[styles.doc, { borderColor: color, backgroundColor: fill }]}>
          <View style={[styles.docLine, { backgroundColor: color }]} />
          <View style={[styles.docLine, styles.docLineShort, { backgroundColor: color }]} />
        </View>
      );
    case 'History':
      return (
        <View style={styles.wrap}>
          <View style={[styles.clock, { borderColor: color }]}>
            <View style={[styles.clockHand, { backgroundColor: color }]} />
          </View>
        </View>
      );
    case 'Profile':
      return (
        <View style={styles.wrap}>
          <View style={[styles.avatar, { borderColor: color, backgroundColor: fill }]} />
        </View>
      );
    default:
      return <View style={[styles.dot, { backgroundColor: color }]} />;
  }
}

const styles = StyleSheet.create({
  wrap: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  roof: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: 1,
  },
  homeBody: { width: 14, height: 10, borderRadius: 2, borderWidth: 1.5 },
  micHead: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5 },
  micStem: { width: 2, height: 5, marginTop: 1 },
  micBase: { width: 12, height: 2, borderRadius: 1, marginTop: 1 },
  doc: { width: 16, height: 20, borderRadius: 3, borderWidth: 1.5, padding: 3, gap: 2 },
  docLine: { height: 2, borderRadius: 1, width: '100%' },
  docLineShort: { width: '70%' },
  clock: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  clockHand: { width: 1.5, height: 6, borderRadius: 1, marginTop: -2 },
  avatar: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
