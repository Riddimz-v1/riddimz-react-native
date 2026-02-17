import React from 'react';
import { View, StyleSheet } from 'react-native';

export function LoadingSkeleton() {
  return (
      <View style={styles.skeleton} />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    width: '100%',
    height: 200,
    backgroundColor: '#333',
    borderRadius: 8,
    opacity: 0.5,
  }
});
