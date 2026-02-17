import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { Sidebar } from '../organisms/Sidebar';
import { MiniPlayer } from '../organisms/MiniPlayer';
import { useTheme } from '@/hooks/useTheme';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const { isLargeScreen } = useResponsive();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.mainContent}>
        {isLargeScreen && Platform.OS === 'web' && (
          <Sidebar />
        )}
        <View style={styles.childContainer}>
          {children}
        </View>
      </View>
      
      {/* MiniPlayer is now managed as a persistent bar at the bottom */}
      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  childContainer: {
    flex: 1,
  },
});
