import { useEffect } from 'react';
import { Audio } from 'expo-av';
import { usePlayerStore } from '@/stores/player';

export function useAudioPlayer() {
    const { currentTrack, isPlaying, play, pause } = usePlayerStore();
    // In a real app, we would manage the Audio.Sound instance here

    useEffect(() => {
        let sound: Audio.Sound | null = null;

        const loadSound = async () => {
            if (currentTrack?.url) {
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: currentTrack.url },
                    { shouldPlay: isPlaying }
                );
                sound = newSound;
            }
        };

        if (currentTrack) {
            loadSound();
        }

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [currentTrack]);

    return {
        currentTrack,
        isPlaying,
        play,
        pause
    };
}
