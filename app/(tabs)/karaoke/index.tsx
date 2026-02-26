import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/utils/constants';
import { karaokeService } from '@/services/api/karaoke';
import { RoomResponse } from '@/services/api/types';
import { useUserStore } from '@/stores/user';
import { useEffect, useState } from 'react';

const PRIMARY = Colors.dark.primary;
type FilterTab = 'all' | 'trending' | 'mine';

export default function KaraokeScreen() {
  const router = useRouter();
  const { profile } = useUserStore();

  const [rooms, setRooms]                 = useState<RoomResponse[]>([]);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState<FilterTab>('all');
  const [createVisible, setCreateVisible] = useState(false);
  const [joinVisible, setJoinVisible]     = useState(false);
  const [roomName, setRoomName]           = useState('');
  const [isPrivate, setIsPrivate]         = useState(false);
  const [creating, setCreating]           = useState(false);
  const [joinId, setJoinId]               = useState('');

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await karaokeService.getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching karaoke rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const myUserId  = profile?.id?.toString();
  const myRooms   = rooms.filter(r => r.host_id === myUserId);
  const otherRooms= rooms.filter(r => r.host_id !== myUserId);

  const visibleRooms =
    filter === 'mine'     ? myRooms :
    filter === 'trending' ? otherRooms :
    rooms;

  const handleCreate = async () => {
    if (!roomName.trim()) return;
    setCreating(true);
    try {
      const room = await karaokeService.createRoom({ name: roomName, is_private: isPrivate });
      setCreateVisible(false);
      setRoomName('');
      router.push(`/(tabs)/karaoke/${room.id}` as any);
    } catch {
      Alert.alert('Error', 'Could not create room. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = () => {
    if (!joinId.trim()) return;
    setJoinVisible(false);
    router.push(`/(tabs)/karaoke/${joinId.trim()}` as any);
  };

  const renderRoom = (item: RoomResponse) => {
    const isHost  = item.host_id === myUserId;
    const viewers = (item.queue?.length ?? 0) + 1;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.roomCard}
        activeOpacity={0.85}
        onPress={() => router.push(`/(tabs)/karaoke/${item.id}` as any)}
      >
        <View style={styles.roomImagePlaceholder}>
          <View style={styles.roomGradOverlay} />
          <Ionicons name="mic-outline" size={32} color="rgba(255,255,255,0.12)" />

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <ThemedText style={styles.liveText}>LIVE</ThemedText>
          </View>

          {isHost && (
            <View style={styles.hostBadge}>
              <ThemedText style={styles.hostBadgeText}>HOST</ThemedText>
            </View>
          )}

          <View style={styles.viewerChip}>
            <Ionicons name="people" size={10} color="#fff" />
            <ThemedText style={styles.viewerText}>{viewers}</ThemedText>
          </View>
        </View>

        <View style={styles.roomInfo}>
          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.roomName}>
            {item.name}
          </ThemedText>
          {item.queue?.length > 0 && (
            <View style={styles.metaRow}>
              <Ionicons name="musical-notes" size={11} color={PRIMARY} />
              <ThemedText style={styles.metaText} numberOfLines={1}>{item.queue[0]}</ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText type="title" style={styles.title}>Sing & Watch</ThemedText>
          <ThemedText style={styles.subtitle}>Live rooms · Join or host</ThemedText>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setJoinVisible(true)}>
            <Ionicons name="enter-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.addButton]} onPress={() => setCreateVisible(true)}>
            <Ionicons name="add" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.pillRow}>
        {([
          { key: 'all',      label: 'All Rooms' },
          { key: 'trending', label: 'Trending' },
          { key: 'mine',     label: 'My Rooms'  },
        ] as { key: FilterTab; label: string }[]).map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.pill, filter === key && styles.pillActive]}
            onPress={() => setFilter(key)}
          >
            <ThemedText
              type="defaultSemiBold"
              style={[styles.pillText, filter === key && styles.pillTextActive]}
            >
              {label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Rooms */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchRooms} tintColor={PRIMARY} />
        }
      >
        {filter === 'all' && myRooms.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Your Live Rooms</ThemedText>
            <View style={styles.grid}>{myRooms.map(renderRoom)}</View>
          </View>
        )}

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {filter === 'mine' ? 'Rooms You Host' : 'Trending Now 🔥'}
          </ThemedText>
          {visibleRooms.filter(r => filter !== 'all' || r.host_id !== myUserId).length > 0 ? (
            <View style={styles.grid}>
              {visibleRooms.filter(r => filter !== 'all' || r.host_id !== myUserId).map(renderRoom)}
            </View>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="mic-outline" size={40} color="#2a2a2a" />
              <ThemedText style={styles.emptyText}>No live rooms right now.</ThemedText>
              <TouchableOpacity onPress={() => setCreateVisible(true)}>
                <ThemedText style={[styles.emptyText, { color: PRIMARY, marginTop: 4 }]}>
                  Start one yourself →
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Room Modal */}
      <Modal visible={createVisible} transparent animationType="slide" onRequestClose={() => setCreateVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <ThemedText type="subtitle" style={styles.modalTitle}>Create a Room</ThemedText>
            <ThemedText style={styles.modalSub}>Start your karaoke session and invite others</ThemedText>

            <View style={styles.inputWrapper}>
              <Ionicons name="mic-outline" size={18} color="#555" />
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Friday Night Vibes"
                placeholderTextColor="#444"
                value={roomName}
                onChangeText={setRoomName}
              />
            </View>

            <View style={styles.switchRow}>
              <View>
                <ThemedText type="defaultSemiBold" style={styles.switchLabel}>Private Room</ThemedText>
                <ThemedText style={styles.switchSub}>Only visible to invited guests</ThemedText>
              </View>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: '#333', true: PRIMARY }}
                thumbColor="#fff"
              />
            </View>

            <TouchableOpacity
              style={[styles.modalPrimaryBtn, (!roomName.trim() || creating) && { opacity: 0.4 }]}
              onPress={handleCreate}
              disabled={!roomName.trim() || creating}
            >
              <Ionicons name="radio" size={18} color="#fff" />
              <ThemedText style={styles.modalPrimaryBtnText}>
                {creating ? 'Creating...' : 'Go Live'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setCreateVisible(false)}>
              <ThemedText style={styles.modalCancelText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Join Room Modal */}
      <Modal visible={joinVisible} transparent animationType="slide" onRequestClose={() => setJoinVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <ThemedText type="subtitle" style={styles.modalTitle}>Join a Room</ThemedText>
            <ThemedText style={styles.modalSub}>Enter the Room ID shared with you</ThemedText>

            <View style={styles.inputWrapper}>
              <Ionicons name="key-outline" size={18} color="#555" />
              <TextInput
                style={styles.modalInput}
                placeholder="Paste Room ID"
                placeholderTextColor="#444"
                value={joinId}
                onChangeText={setJoinId}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.modalPrimaryBtn, !joinId.trim() && { opacity: 0.4 }]}
              onPress={handleJoin}
              disabled={!joinId.trim()}
            >
              <Ionicons name="enter" size={18} color="#fff" />
              <ThemedText style={styles.modalPrimaryBtnText}>Join Room</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setJoinVisible(false)}>
              <ThemedText style={styles.modalCancelText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // ── existing styles preserved exactly ──
  container:            { flex: 1, paddingTop: 60 },
  scroll:               { flex: 1 },
  header:               { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, marginBottom: 20 },
  headerLeft:           { flex: 1 },
  title:                { fontSize: 28 },
  subtitle:             { fontSize: 13, color: '#6a6a6a', marginTop: 4 },
  addButton:            { backgroundColor: PRIMARY, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  section:              { marginBottom: 30, paddingHorizontal: 20 },
  sectionTitle:         { fontSize: 18, marginBottom: 15, color: '#fff' },
  grid:                 { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  roomCard:             { width: '47%', backgroundColor: '#1a1a1a', borderRadius: 16, overflow: 'hidden', marginBottom: 5 },
  roomImagePlaceholder: { aspectRatio: 1, backgroundColor: '#222', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  liveBadge:            { position: 'absolute', top: 10, left: 10, backgroundColor: '#ff4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot:              { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText:             { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  roomInfo:             { padding: 12 },
  metaRow:              { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  metaText:             { fontSize: 12, color: '#666', flex: 1 },
  empty:                { alignItems: 'center', marginTop: 20, padding: 20, backgroundColor: '#1a1a1a', borderRadius: 12 },
  emptyText:            { color: '#555', fontSize: 14, marginTop: 8 },

  // ── new styles ──
  headerActions:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn:              { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1e1e1e', justifyContent: 'center', alignItems: 'center' },

  pillRow:              { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  pill:                 { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2a2a2a' },
  pillActive:           { backgroundColor: '#fff' },
  pillText:             { fontSize: 13, color: '#fff' },
  pillTextActive:       { fontSize: 13, color: '#000' },

  roomGradOverlay:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(118,51,181,0.06)' },
  hostBadge:            { position: 'absolute', top: 10, right: 10, backgroundColor: PRIMARY, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
  hostBadgeText:        { fontSize: 9, fontWeight: 'bold', color: '#fff' },
  viewerChip:           { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewerText:           { fontSize: 10, color: '#fff' },
  roomName:             { fontSize: 13, color: '#fff', marginBottom: 2 },

  modalBackdrop:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  modalSheet:           { backgroundColor: '#111', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 44 },
  modalHandle:          { width: 36, height: 4, backgroundColor: '#2a2a2a', borderRadius: 2, alignSelf: 'center', marginBottom: 22 },
  modalTitle:           { fontSize: 20, color: '#fff', marginBottom: 6 },
  modalSub:             { fontSize: 13, color: '#555', marginBottom: 22 },
  inputWrapper:         { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1a1a1a', borderRadius: 12, paddingHorizontal: 14, marginBottom: 16, borderWidth: 1, borderColor: '#2a2a2a' },
  modalInput:           { flex: 1, height: 50, color: '#fff', fontSize: 15 },
  switchRow:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  switchLabel:          { color: '#fff', fontSize: 14 },
  switchSub:            { color: '#555', fontSize: 12, marginTop: 2 },
  modalPrimaryBtn:      { backgroundColor: PRIMARY, height: 52, borderRadius: 26, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 12 },
  modalPrimaryBtnText:  { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalCancelBtn:       { height: 46, justifyContent: 'center', alignItems: 'center' },
  modalCancelText:      { color: '#444', fontSize: 15 },
});