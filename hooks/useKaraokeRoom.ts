import { useKaraokeStore } from '@/stores/karaoke';

export function useKaraokeRoom() {
    const { roomId, participants, currentSong, joinRoom, leaveRoom, setSong } = useKaraokeStore();

    return {
        roomId,
        participants,
        currentSong,
        join: joinRoom,
        leave: leaveRoom,
        updateSong: setSong
    };
}
