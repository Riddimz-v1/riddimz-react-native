import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface IconButtonProps {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
}

export function IconButton({ name, onPress, size = 24, color }: IconButtonProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Ionicons name={name} size={size} color={color || colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
  },
});
