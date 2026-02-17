import { View, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { usePlayerStore } from '@/stores/player';
import { ThemedText } from '../atoms/ThemedText';
import { Colors } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';

export function MiniPlayer() {
    const { currentTrack, isPlaying, play, pause } = usePlayerStore();
    const { colors } = useTheme();
    const { isLargeScreen } = useResponsive();

    if (!currentTrack) return null;

    const isWeb = Platform.OS === 'web';
    const showDesktopPlayer = isLargeScreen && isWeb;

    return (
        <View style={[
            styles.container, 
            { 
                backgroundColor: showDesktopPlayer ? '#000' : colors.secondary, 
                borderTopColor: '#333' 
            },
            showDesktopPlayer && styles.desktopContainer
        ]}>
            <View style={styles.trackInfo}>
                <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
                <View>
                    <ThemedText type="defaultSemiBold">{currentTrack.title}</ThemedText>
                    <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>{currentTrack.artist}</ThemedText>
                </View>
                {showDesktopPlayer && (
                    <TouchableOpacity style={{ marginLeft: 15 }}>
                        <Ionicons name="heart-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.controls}>
                {showDesktopPlayer && (
                    <TouchableOpacity>
                        <Ionicons name="shuffle" size={20} color="#b3b3b3" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity>
                    <Ionicons name="play-skip-back" size={showDesktopPlayer ? 24 : 20} color={showDesktopPlayer ? "#fff" : colors.text} />
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => isPlaying ? pause() : play()}
                    style={showDesktopPlayer ? styles.playButtonDesktop : null}
                >
                    <Ionicons 
                        name={isPlaying ? "pause-circle" : "play-circle"} 
                        size={showDesktopPlayer ? 48 : 32} 
                        color={showDesktopPlayer ? "#fff" : colors.text} 
                    />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Ionicons name="play-skip-forward" size={showDesktopPlayer ? 24 : 20} color={showDesktopPlayer ? "#fff" : colors.text} />
                </TouchableOpacity>
                {showDesktopPlayer && (
                    <TouchableOpacity>
                        <Ionicons name="repeat" size={20} color="#b3b3b3" />
                    </TouchableOpacity>
                )}
            </View>

            {showDesktopPlayer && (
                <View style={[styles.extraControls, { width: 180 }]}>
                    <Ionicons name="volume-medium" size={20} color="#b3b3b3" />
                    <View style={styles.volumeBar}>
                        <View style={[styles.volumeProgress, { backgroundColor: colors.primary }]} />
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 85, // Above tab bar on mobile
        left: 8,
        right: 8,
        height: 60,
        borderRadius: 8,
        borderTopWidth: 1,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100,
    },
    desktopContainer: {
        position: 'relative',
        bottom: 0,
        left: 0,
        right: 0,
        height: 90,
        borderRadius: 0,
        paddingHorizontal: 20,
        backgroundColor: '#000',
    },
    trackInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minWidth: 200,
    },
    artwork: {
        width: 48,
        height: 48,
        borderRadius: 4,
        backgroundColor: '#333'
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    playButtonDesktop: {
        transform: [{ scale: 1.1 }],
    },
    extraControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'flex-end',
    },
    volumeBar: {
        width: 100,
        height: 4,
        backgroundColor: '#4d4d4d',
        borderRadius: 2,
    },
    volumeProgress: {
        width: '70%',
        height: '100%',
        borderRadius: 2,
    }
});
