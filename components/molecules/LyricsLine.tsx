import React from 'react';
import { ThemedText } from '../atoms/ThemedText';
import { useTheme } from '@/hooks/useTheme';

export function LyricsLine({ text, active }: { text: string, active?: boolean }) {
  const { colors } = useTheme();
  return (
    <ThemedText 
        style={[
            { fontSize: 24, textAlign: 'center', marginVertical: 5 },
            active ? { color: colors.primary, fontWeight: 'bold' } : { opacity: 0.5 }
        ]}
    >
        {text}
    </ThemedText>
  );
}
