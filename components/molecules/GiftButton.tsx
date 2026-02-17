import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/utils/constants';
import { ThemedText } from '../atoms/ThemedText';

export function GiftButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Ionicons name="gift" size={24} color={Colors.dark.primary} />
      <ThemedText style={{ color: Colors.dark.primary, fontSize: 12 }}>Gift</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
  }
});
