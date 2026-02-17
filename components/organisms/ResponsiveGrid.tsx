import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { BREAKPOINTS } from '@/hooks/useResponsive';

interface ResponsiveGridProps {
  children: React.ReactNode;
  maxColumns?: number;
  itemMinWidth?: number;
  gap?: number;
}

export function ResponsiveGrid({ 
  children, 
  maxColumns = 6, 
  itemMinWidth = 160,
  gap = 16 
}: ResponsiveGridProps) {
  const { width } = useWindowDimensions();
  
  // Calculate columns based on width
  // Subtracting some padding/margins
  const availableWidth = width - 40; 
  const columns = Math.min(
    maxColumns,
    Math.max(1, Math.floor(availableWidth / (itemMinWidth + gap)))
  );

  return (
    <View style={[styles.grid, { gap }]}>
        {React.Children.map(children, (child) => (
            <View style={{ width: `${(100 / columns) - (gap / availableWidth * 100)}%` }}>
                {child}
            </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
});
