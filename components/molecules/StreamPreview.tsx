import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../atoms/ThemedText';

export function StreamPreview() {
  return (
    <View style={styles.preview}>
      <ThemedText>Stream Preview</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: '100%',
    height: 200,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  }
});
