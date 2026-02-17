import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton } from '../atoms/IconButton';

export function KaraokeControls() {
  return (
    <View style={styles.row}>
      <IconButton name="mic" onPress={() => {}} />
      <IconButton name="videocam" onPress={() => {}} />
      <IconButton name="musical-notes" onPress={() => {}} />
      <IconButton name="exit" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    padding: 20,
  }
});
