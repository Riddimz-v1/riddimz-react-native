import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/utils/constants';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { karaokeService } from '@/services/api/karaoke';
import { ChatPanel, ChatMessage } from '@/components/organisms/Karaoke/ChatPanel';
import { CommentStream } from '@/components/organisms/Karaoke/CommentStream';
import { KaraokeSocket } from '@/services/realtime/karaokeSocket';
import * as DocumentPicker from 'expo-document-picker';

const PRIMARY = Colors.dark.primary;

interface HostViewProps {
  roomId: string;
  socket: KaraokeSocket | null;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isMicOn: boolean;
  onToggleMic: () => void;
  onEndSession: () => void;
  participants: string[];
  guests: string[];
  pendingRequests: string[];
  onAcceptRequest: (id: string) => void;
  currentSong: any;
}

type Tab = 'chat' | 'queue' | 'requests';

export function HostView({
  roomId,
  socket,
  messages,
  onSendMessage,
  isMicOn,
  onToggleMic,
  onEndSession,
  participants,
  guests,
  pendingRequests,
  onAcceptRequest,
  currentSong,
}: HostViewProps) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [tab, setTab]                   = useState<Tab>('chat');
  const [showSearch, setShowSearch]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching]   = useState(false);
  const [queue, setQueue]               = useState<any[]>([]);
  const [isPlaying, setIsPlaying]       = useState(false);

  const liveCount = participants.length + guests.length + 1;

  // ── Song search ────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const data = await karaokeService.searchGlobally(searchQuery);
      setSearchResults(data.tracks ?? []);
    } catch {
      Alert.alert('Search Error', 'Could not search songs. Try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const addToQueue = async (track: any) => {
    try {
      await karaokeService.addToQueue(roomId, track.url ?? track.id);
      setQueue(prev => [...prev, track]);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch {
      Alert.alert('Error', 'Failed to add song to queue.');
    }
  };

  // ── File upload ────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        setQueue(prev => [...prev, { title: file.name, url: file.uri, duration: '--' }]);
        Alert.alert('Uploaded', `${file.name} added to queue.`);
      }
    } catch {
      Alert.alert('Error', 'Could not upload file.');
    }
  };

  // ── Playback toggle ────────────────────────────────────────────────────────
  const togglePlay = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    socket?.sendMessage(next ? 'soundtrack_play' : 'soundtrack_pause', {});
  };

  return (
    <View style={styles.container}>

      {/* ── Camera background ─────────────────────────────────────────────── */}
      <View style={StyleSheet.absoluteFill}>
        {cameraPermission?.granted ? (
          <CameraView style={StyleSheet.absoluteFill} facing="front" />
        ) : (
          <View style={styles.noCamera}>
            <Ionicons name="videocam-off-outline" size={52} color="#222" />
            <TouchableOpacity onPress={() => requestCameraPermission()} style={styles.enableCamBtn}>
              <ThemedText style={{ color: PRIMARY, fontSize: 13 }}>Enable Camera</ThemedText>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.overlay} />
      </View>

      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <View style={styles.row}>
          <View style={styles.liveChip}>
            <View style={styles.liveDot} />
            <ThemedText style={styles.liveChipText}>LIVE</ThemedText>
          </View>
          <View style={styles.viewersChip}>
            <Ionicons name="people" size={12} color="#ccc" />
            <ThemedText style={styles.viewersText}>{liveCount}</ThemedText>
          </View>
        </View>

        <View style={[styles.roleBadge, { backgroundColor: PRIMARY }]}>
          <ThemedText style={styles.roleBadgeText}>HOST</ThemedText>
        </View>

        <TouchableOpacity style={styles.endBtn} onPress={onEndSession}>
          <Ionicons name="stop-circle" size={16} color="#fff" />
          <ThemedText style={styles.endBtnText}>End</ThemedText>
        </TouchableOpacity>
      </View>

      {/* ── Pending requests toast ────────────────────────────────────────── */}
      {pendingRequests.length > 0 && (
        <TouchableOpacity style={styles.requestsToast} onPress={() => setTab('requests')}>
          <Ionicons name="people-circle-outline" size={18} color={PRIMARY} />
          <ThemedText style={styles.toastLabel}>
            {pendingRequests.length} want{pendingRequests.length === 1 ? 's' : ''} to perform
          </ThemedText>
          <ThemedText style={[styles.toastView, { color: PRIMARY }]}>View →</ThemedText>
        </TouchableOpacity>
      )}

      {/* ── Lyrics ────────────────────────────────────────────────────────── */}
      <View style={styles.lyricsArea} pointerEvents="none">
        {currentSong ? (
          <>
            <ThemedText style={styles.lyricsLine}>"I'm blinded by the lights..."</ThemedText>
            <ThemedText style={styles.lyricsTrack}>{currentSong.title}</ThemedText>
          </>
        ) : (
          <ThemedText style={styles.lyricsHint}>Search or upload a song to start</ThemedText>
        )}
      </View>

      {/* ── Comment stream overlay ────────────────────────────────────────── */}
      <CommentStream messages={messages} />

      {/* ── Bottom panel ──────────────────────────────────────────────────── */}
      <View style={styles.bottomPanel}>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.ctrlBtn, !isMicOn && styles.ctrlBtnDanger]}
            onPress={onToggleMic}
          >
            <Ionicons name={isMicOn ? 'mic' : 'mic-off'} size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ctrlBtn, isPlaying && { borderColor: PRIMARY }]}
            onPress={togglePlay}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ctrlBtn, showSearch && { borderColor: PRIMARY }]}
            onPress={() => setShowSearch(v => !v)}
          >
            <Ionicons name="search" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.ctrlBtn} onPress={handleUpload}>
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ctrlBtn, tab === 'queue' && { borderColor: PRIMARY }]}
            onPress={() => setTab(t => t === 'queue' ? 'chat' : 'queue')}
          >
            <Ionicons name="list" size={20} color="#fff" />
            {queue.length > 0 && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{queue.length}</ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Song search panel */}
        {showSearch && (
          <View style={styles.searchPanel}>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search YouTube / SoundCloud..."
                placeholderTextColor="#444"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <TouchableOpacity style={styles.searchGoBtn} onPress={handleSearch}>
                <Ionicons
                  name={isSearching ? 'hourglass-outline' : 'search'}
                  size={18}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 150 }} keyboardShouldPersistTaps="handled">
              {searchResults.map((track, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.searchResult}
                  onPress={() => addToQueue(track)}
                >
                  <Ionicons name="musical-note" size={15} color={PRIMARY} />
                  <View style={styles.searchResultInfo}>
                    <ThemedText style={styles.searchResultTitle} numberOfLines={1}>
                      {track.title}
                    </ThemedText>
                    <ThemedText style={styles.searchResultDuration}>{track.duration ?? ''}</ThemedText>
                  </View>
                  <Ionicons name="add-circle-outline" size={18} color={PRIMARY} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['chat', 'queue', 'requests'] as Tab[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <ThemedText style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'chat'
                  ? 'Chat'
                  : t === 'queue'
                  ? `Queue${queue.length ? ` (${queue.length})` : ''}`
                  : `Requests${pendingRequests.length ? ` (${pendingRequests.length})` : ''}`}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        <View style={styles.tabContent}>

          {tab === 'chat' && (
            <ChatPanel messages={messages} onSend={onSendMessage} placeholder="Send a message..." />
          )}

          {tab === 'queue' && (
            <ScrollView contentContainerStyle={styles.tabInner}>
              {queue.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="musical-notes-outline" size={30} color="#2a2a2a" />
                  <ThemedText style={styles.emptyText}>Queue is empty</ThemedText>
                </View>
              ) : (
                queue.map((track, i) => (
                  <View key={i} style={styles.queueItem}>
                    <View style={styles.queueNum}>
                      <ThemedText style={styles.queueNumText}>{i + 1}</ThemedText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.queueTitle} numberOfLines={1}>{track.title}</ThemedText>
                      <ThemedText style={styles.queueDuration}>{track.duration ?? ''}</ThemedText>
                    </View>
                    {i === 0 && <Ionicons name="radio" size={14} color={PRIMARY} />}
                  </View>
                ))
              )}
            </ScrollView>
          )}

          {tab === 'requests' && (
            <ScrollView contentContainerStyle={styles.tabInner}>
              {pendingRequests.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="person-add-outline" size={30} color="#2a2a2a" />
                  <ThemedText style={styles.emptyText}>No pending requests</ThemedText>
                </View>
              ) : (
                pendingRequests.map(uid => (
                  <View key={uid} style={styles.requestItem}>
                    <View style={styles.requestAvatar}>
                      <ThemedText style={styles.requestAvatarText}>
                        {uid.slice(0, 2).toUpperCase()}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.requestId} numberOfLines={1}>
                      {uid.slice(0, 16)}…
                    </ThemedText>
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => onAcceptRequest(uid)}>
                      <ThemedText style={styles.acceptBtnText}>Accept</ThemedText>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          )}

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#000' },
  noCamera:           { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },
  enableCamBtn:       { marginTop: 10, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: PRIMARY },
  overlay:            { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },

  topBar:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: 16, paddingBottom: 12 },
  row:                { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveChip:           { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#e5333d', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  liveDot:            { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff' },
  liveChipText:       { fontSize: 10, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 },
  viewersChip:        { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  viewersText:        { fontSize: 11, color: '#ccc' },
  roleBadge:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  roleBadgeText:      { fontSize: 10, fontWeight: 'bold', color: '#fff', letterSpacing: 0.8 },
  endBtn:             { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#c0392b', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  endBtnText:         { fontSize: 12, fontWeight: 'bold', color: '#fff' },

  requestsToast:      { marginHorizontal: 16, marginTop: 8, backgroundColor: 'rgba(0,0,0,0.75)', borderWidth: 1, borderColor: PRIMARY, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  toastLabel:         { flex: 1, color: '#ccc', fontSize: 12 },
  toastView:          { fontSize: 12, fontWeight: 'bold' },

  lyricsArea:         { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  lyricsLine:         { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 },
  lyricsTrack:        { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 10, textAlign: 'center' },
  lyricsHint:         { fontSize: 14, color: 'rgba(255,255,255,0.25)', textAlign: 'center' },

  bottomPanel:        { backgroundColor: 'rgba(0,0,0,0.85)', borderTopWidth: 1, borderTopColor: '#1a1a1a', paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 32 : 16 },
  controlsRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, marginBottom: 10 },
  ctrlBtn:            { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', position: 'relative' },
  ctrlBtnDanger:      { backgroundColor: '#c0392b', borderColor: '#c0392b' },
  badge:              { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: PRIMARY, justifyContent: 'center', alignItems: 'center' },
  badgeText:          { fontSize: 9, fontWeight: 'bold', color: '#fff' },

  searchPanel:        { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#111', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#2a2a2a' },
  searchRow:          { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  searchInput:        { flex: 1, height: 40, backgroundColor: '#1a1a1a', borderRadius: 8, paddingHorizontal: 12, color: '#fff', fontSize: 14 },
  searchGoBtn:        { width: 40, height: 40, borderRadius: 8, backgroundColor: PRIMARY, justifyContent: 'center', alignItems: 'center' },
  searchResult:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#1e1e1e' },
  searchResultInfo:   { flex: 1 },
  searchResultTitle:  { color: '#fff', fontSize: 13 },
  searchResultDuration: { color: '#555', fontSize: 11 },

  tabRow:             { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 2 },
  tabBtn:             { flex: 1, paddingVertical: 8, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive:       { borderBottomColor: PRIMARY },
  tabText:            { fontSize: 12, color: '#555' },
  tabTextActive:      { color: PRIMARY, fontWeight: 'bold' },
  tabContent:         { height: 190 },
  tabInner:           { padding: 12, gap: 4 },

  emptyState:         { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText:          { color: '#333', fontSize: 13 },

  queueItem:          { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  queueNum:           { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(118,51,181,0.15)', justifyContent: 'center', alignItems: 'center' },
  queueNumText:       { color: PRIMARY, fontWeight: 'bold', fontSize: 11 },
  queueTitle:         { color: '#fff', fontSize: 13 },
  queueDuration:      { color: '#555', fontSize: 11 },

  requestItem:        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  requestAvatar:      { width: 34, height: 34, borderRadius: 17, backgroundColor: '#1e1e1e', justifyContent: 'center', alignItems: 'center' },
  requestAvatarText:  { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  requestId:          { flex: 1, color: '#bbb', fontSize: 13 },
  acceptBtn:          { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: PRIMARY, borderRadius: 14 },
  acceptBtnText:      { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});