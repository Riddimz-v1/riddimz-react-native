import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/utils/constants';
import { ChatPanel, ChatMessage } from '@/components/organisms/Karaoke/ChatPanel';
import { CommentStream } from '@/components/organisms/Karaoke/CommentStream';
import { useWallet } from '@/hooks/useWallet';
import { useRouter } from 'expo-router';
import { KaraokeSocket } from '@/services/realtime/karaokeSocket';

const PRIMARY = Colors.dark.primary;

interface GuestViewProps {
  socket: KaraokeSocket | null;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  participants: string[];
  guests: string[];
  activeStreamId: string | null;
  onSwitchStream: (id: string) => void;
  onRequestToJoin: () => void;
  currentSong: any;
  onLeave: () => void;
}

export function GuestView({
  socket,
  messages,
  onSendMessage,
  participants,
  guests,
  activeStreamId,
  onSwitchStream,
  onRequestToJoin,
  currentSong,
  onLeave,
}: GuestViewProps) {
  const router = useRouter();
  const { isConnected, gift } = useWallet();
  const liveCount = participants.length + guests.length + 1;

  const handleGift = () => {
    if (!isConnected) {
      Alert.alert(
        'Wallet Required',
        'Connect your wallet to send gifts.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Wallet', onPress: () => router.push('/(tabs)/profile/wallet' as any) },
        ]
      );
      return;
    }
    Alert.alert(
      '🎁 Send Gift',
      'Choose an amount',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '5 RDMZ',  onPress: async () => { const ok = await gift(5,  'HOST_WALLET'); if (ok) Alert.alert('🎉', '5 RDMZ gifted!'); } },
        { text: '10 RDMZ', onPress: async () => { const ok = await gift(10, 'HOST_WALLET'); if (ok) Alert.alert('🎉', '10 RDMZ gifted!'); } },
        { text: '50 RDMZ', onPress: async () => { const ok = await gift(50, 'HOST_WALLET'); if (ok) Alert.alert('🎉', '50 RDMZ gifted!'); } },
      ]
    );
  };

  return (
    <View style={styles.container}>

      {/* ── Main stream area ──────────────────────────────────────────────── */}
      <View style={styles.streamArea}>
        {activeStreamId ? (
          <View style={styles.streamPlaceholder}>
            <Ionicons name="radio" size={48} color="#2a2a2a" />
            <ThemedText style={styles.streamLabel}>
              Viewing: {activeStreamId.slice(0, 8)}…
            </ThemedText>
          </View>
        ) : (
          <View style={styles.streamPlaceholder}>
            <Ionicons name="mic-outline" size={52} color="#1e1e1e" />
            <ThemedText style={styles.streamLabel}>Waiting for performers…</ThemedText>
          </View>
        )}
        <View style={styles.overlay} />
      </View>

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <View style={styles.liveChip}>
            <View style={styles.liveDot} />
            <ThemedText style={styles.liveChipText}>LIVE</ThemedText>
          </View>
          <View style={styles.viewersChip}>
            <Ionicons name="people" size={12} color="#ccc" />
            <ThemedText style={styles.viewersText}>{liveCount}</ThemedText>
          </View>
        </View>

        <View style={styles.topRight}>
          {/* Gift — always visible button */}
          <TouchableOpacity style={styles.giftBtn} onPress={handleGift}>
            <Ionicons name="gift" size={15} color="#FFD700" />
            <ThemedText style={styles.giftBtnText}>Gift</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.leaveBtn} onPress={onLeave}>
            <Ionicons name="log-out-outline" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Singer switcher — active performer thumbnails ──────────────────── */}
      {participants.length > 0 && (
        <View style={styles.singerSwitcher}>
          {participants.map(id => (
            <TouchableOpacity
              key={id}
              style={[styles.singerThumb, activeStreamId === id && styles.singerThumbActive]}
              onPress={() => onSwitchStream(id)}
            >
              <View style={styles.singerAvatar}>
                <ThemedText style={styles.singerAvatarText}>
                  {id.slice(0, 2).toUpperCase()}
                </ThemedText>
              </View>
              {activeStreamId === id && (
                <View style={styles.activeDot}>
                  <View style={styles.activeDotInner} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Comment stream overlay ────────────────────────────────────────── */}
      <CommentStream messages={messages} />

      {/* ── Lyrics (read-only) ────────────────────────────────────────────── */}
      {currentSong && (
        <View style={styles.lyricsArea} pointerEvents="none">
          <ThemedText style={styles.lyricsLine}>"I'm blinded by the lights..."</ThemedText>
          <ThemedText style={styles.lyricsTrack}>{currentSong.title}</ThemedText>
        </View>
      )}

      {/* ── Bottom panel ──────────────────────────────────────────────────── */}
      <View style={styles.bottomPanel}>
        {/* Request to perform */}
        <TouchableOpacity style={styles.requestBtn} onPress={onRequestToJoin}>
          <Ionicons name="videocam" size={16} color="#fff" />
          <ThemedText style={styles.requestBtnText}>Request to Perform</ThemedText>
        </TouchableOpacity>

        {/* Chat */}
        <View style={styles.chatArea}>
          <ChatPanel
            messages={messages}
            onSend={onSendMessage}
            placeholder="Say something..."
          />
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#000' },

  streamArea:         { ...StyleSheet.absoluteFillObject },
  streamPlaceholder:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#080808', gap: 12 },
  streamLabel:        { color: '#2a2a2a', fontSize: 13 },
  overlay:            { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },

  topBar:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: 16, paddingBottom: 12 },
  topLeft:            { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topRight:           { flexDirection: 'row', alignItems: 'center', gap: 8 },

  liveChip:           { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#e5333d', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  liveDot:            { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff' },
  liveChipText:       { fontSize: 10, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 },
  viewersChip:        { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  viewersText:        { fontSize: 11, color: '#ccc' },

  // Gift button — always visible
  giftBtn:            { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,215,0,0.1)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.35)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  giftBtnText:        { fontSize: 12, fontWeight: 'bold', color: '#FFD700' },
  leaveBtn:           { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },

  // Singer switcher
  singerSwitcher:     { position: 'absolute', top: 108, left: 12, gap: 10 },
  singerThumb:        { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: 'transparent', overflow: 'visible' },
  singerThumbActive:  { borderColor: PRIMARY },
  singerAvatar:       { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1e1e1e', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  singerAvatarText:   { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  activeDot:          { position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  activeDotInner:     { width: 8, height: 8, borderRadius: 4, backgroundColor: PRIMARY },

  // Lyrics
  lyricsArea:         { position: 'absolute', left: 0, right: 0, top: '38%', alignItems: 'center', paddingHorizontal: 30 },
  lyricsLine:         { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 },
  lyricsTrack:        { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 8, textAlign: 'center' },

  // Bottom panel
  bottomPanel:        { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.85)', borderTopWidth: 1, borderTopColor: '#1a1a1a', paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 32 : 16 },
  requestBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: PRIMARY, height: 44, borderRadius: 22, marginHorizontal: 16, marginBottom: 10 },
  requestBtnText:     { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  chatArea:           { height: 200 },
});