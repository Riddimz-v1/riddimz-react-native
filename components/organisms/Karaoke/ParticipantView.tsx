import {
  StyleSheet,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/utils/constants';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { ChatPanel, ChatMessage } from '@/components/organisms/Karaoke/ChatPanel';
import { CommentStream } from '@/components/organisms/Karaoke/CommentStream';

const PRIMARY = Colors.dark.primary;
type LyricsPosition = 'top' | 'center' | 'bottom';

interface ParticipantViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isMicOn: boolean;
  onToggleMic: () => void;
  onLeave: () => void;
  currentSong: any;
}

export function ParticipantView({
  messages,
  onSendMessage,
  isMicOn,
  onToggleMic,
  onLeave,
  currentSong,
}: ParticipantViewProps) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [lyricsPos, setLyricsPos] = useState<LyricsPosition>('center');

  const lyricsStyle =
    lyricsPos === 'top'    ? styles.lyricsTop :
    lyricsPos === 'bottom' ? styles.lyricsBottom :
    styles.lyricsCenter;

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
        <View style={[styles.roleBadge, { backgroundColor: '#1a6b3e' }]}>
          <ThemedText style={styles.roleBadgeText}>PERFORMER</ThemedText>
        </View>
        <TouchableOpacity style={styles.leaveBtn} onPress={onLeave}>
          <Ionicons name="log-out-outline" size={16} color="#fff" />
          <ThemedText style={styles.leaveBtnText}>Leave</ThemedText>
        </TouchableOpacity>
      </View>

      {/* ── Lyrics — repositionable ───────────────────────────────────────── */}
      <View style={[styles.lyricsWrapper, lyricsStyle]} pointerEvents="box-none">
        {currentSong ? (
          <>
            <ThemedText style={styles.lyricsLine}>"I'm blinded by the lights..."</ThemedText>
            <ThemedText style={styles.lyricsTrack}>{currentSong.title}</ThemedText>
          </>
        ) : (
          <ThemedText style={styles.lyricsHint}>Waiting for a song...</ThemedText>
        )}

        {/* Position controls */}
        <View style={styles.posRow}>
          {(['top', 'center', 'bottom'] as LyricsPosition[]).map(pos => (
            <TouchableOpacity
              key={pos}
              style={[styles.posBtn, lyricsPos === pos && styles.posBtnActive]}
              onPress={() => setLyricsPos(pos)}
            >
              <Ionicons
                name={pos === 'top' ? 'arrow-up' : pos === 'center' ? 'remove' : 'arrow-down'}
                size={13}
                color={lyricsPos === pos ? PRIMARY : '#555'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Comment stream overlay ────────────────────────────────────────── */}
      <CommentStream messages={messages} />

      {/* ── Bottom panel ──────────────────────────────────────────────────── */}
      <View style={styles.bottomPanel}>
        {/* Mic control */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.ctrlBtn, !isMicOn && styles.ctrlBtnDanger]}
            onPress={onToggleMic}
          >
            <Ionicons name={isMicOn ? 'mic' : 'mic-off'} size={20} color="#fff" />
          </TouchableOpacity>
          <ThemedText style={styles.micLabel}>
            {isMicOn ? 'Mic On' : 'Mic Off'}
          </ThemedText>
        </View>

        {/* Chat */}
        <View style={styles.chatArea}>
          <ChatPanel
            messages={messages}
            onSend={onSendMessage}
            placeholder="Send a message..."
          />
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#000' },
  noCamera:         { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' },
  enableCamBtn:     { marginTop: 10, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: PRIMARY },
  overlay:          { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },

  topBar:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: 16, paddingBottom: 12 },
  roleBadge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  roleBadgeText:    { fontSize: 10, fontWeight: 'bold', color: '#fff', letterSpacing: 0.8 },
  leaveBtn:         { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  leaveBtnText:     { fontSize: 12, color: '#fff' },

  // Lyrics positioning
  lyricsWrapper:    { position: 'absolute', left: 24, right: 24, alignItems: 'center' },
  lyricsTop:        { top: 110 },
  lyricsCenter:     { top: '35%' },
  lyricsBottom:     { bottom: 280 },
  lyricsLine:       { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10 },
  lyricsTrack:      { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8, textAlign: 'center' },
  lyricsHint:       { fontSize: 14, color: 'rgba(255,255,255,0.25)', textAlign: 'center' },

  posRow:           { flexDirection: 'row', gap: 8, marginTop: 12 },
  posBtn:           { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  posBtnActive:     { borderColor: PRIMARY, backgroundColor: 'rgba(118,51,181,0.15)' },

  bottomPanel:      { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.85)', borderTopWidth: 1, borderTopColor: '#1a1a1a', paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 32 : 16 },
  controlsRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, marginBottom: 10 },
  ctrlBtn:          { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  ctrlBtnDanger:    { backgroundColor: '#c0392b', borderColor: '#c0392b' },
  micLabel:         { fontSize: 12, color: '#666' },
  chatArea:         { height: 200 },
});