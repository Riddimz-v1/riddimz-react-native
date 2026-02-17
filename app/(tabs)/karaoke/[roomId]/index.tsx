import { StyleSheet, View, TouchableOpacity, Alert, Platform, TextInput, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUserStore } from '@/stores/user';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { Button } from '@/components/atoms/Button';
import { useTheme } from '@/hooks/useTheme';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { KaraokeSocket } from '@/services/realtime/karaokeSocket';
import { useKaraokeStore, UserRole } from '@/stores/karaoke';
import { karaokeService } from '@/services/api/karaoke';

import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '@/hooks/useWallet';
import { Colors } from '@/utils/constants';

import { peerManager } from '@/services/realtime/peerManager';

export default function KaraokeRoomScreen() {
    const { roomId } = useLocalSearchParams<{ roomId: string }>();
    const router = useRouter();
    const { profile } = useUserStore();
    const { colors } = useTheme();
    const { isConnected, gift, address } = useWallet();
    
    // Selective Zustand subscriptions to prevent unnecessary re-renders
    const currentSong = useKaraokeStore(state => state.currentSong);
    const participants = useKaraokeStore(state => state.participants);
    const guests = useKaraokeStore(state => state.guests);
    const remoteStreams = useKaraokeStore(state => state.remoteStreams);
    const userRole = useKaraokeStore(state => state.userRole);
    const activeStreamId = useKaraokeStore(state => state.activeStreamId);
    const pendingRequests = useKaraokeStore(state => state.pendingRequests);
    
    // Memoized actions to prevent re-creating functions
    const setSong = useKaraokeStore(state => state.setSong);
    const joinRoom = useKaraokeStore(state => state.joinRoom);
    const leaveRoom = useKaraokeStore(state => state.leaveRoom);
    const addParticipant = useKaraokeStore(state => state.addParticipant);
    const removeParticipant = useKaraokeStore(state => state.removeParticipant);
    const addGuest = useKaraokeStore(state => state.addGuest);
    const removeGuest = useKaraokeStore(state => state.removeGuest);
    const addRemoteStream = useKaraokeStore(state => state.addRemoteStream);
    const removeRemoteStream = useKaraokeStore(state => state.removeRemoteStream);
    const addJoinRequest = useKaraokeStore(state => state.addJoinRequest);
    const removeJoinRequest = useKaraokeStore(state => state.removeJoinRequest);
    const setActiveStream = useKaraokeStore(state => state.setActiveStream);
    const setRole = useKaraokeStore(state => state.setRole);
    
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [audioPermission, setAudioPermission] = useState<boolean | null>(null);
    const [isMicOn, setIsMicOn] = useState(true);
    const [socket, setSocket] = useState<KaraokeSocket | null>(null);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // Soundtrack state
    const [soundtrack, setSoundtrack] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [roomData, setRoomData] = useState<any>(null);
    
    // Track initialization to prevent duplicate socket connections
    const isInitializedRef = useRef(false);

    useEffect(() => {
        if (!roomId || !address || !profile?.id || isInitializedRef.current) return;

        isInitializedRef.current = true;
        let isSubscribed = true;

        const initRoom = async () => {
            try {
                // In a real app, we'd have a getRoomById service
                // For now, let's assume getRooms is sufficient or we just use the ID
                const rooms = await karaokeService.getRooms();
                const room = rooms.find(r => r.id === roomId);
                
                if (!isSubscribed) return; // Prevent state updates if unmounted
                
                const myUserId = profile.id.toString();
                const role: UserRole = room?.host_id === myUserId ? 'host' : 'guest';
                
                console.log('[Karaoke] Initializing room - myUserId:', myUserId, 'host_id:', room?.host_id, 'role:', role);
                
                await joinRoom(roomId, role);

                const ks = new KaraokeSocket(roomId, (message) => {
                    const myUserId = profile.id.toString(); // Declare once for all cases
                    console.log('[KaraokeSocket] Received:', message);
                    switch (message.event) {
                        case 'track_change':
                            setSong(message.data);
                            break;
                        case 'user_joined':
                            const { userId, role: userRoleJoined } = message.data;
                            console.log('[KaraokeSocket] user_joined - userId:', userId, 'myUserId:', myUserId, 'role:', userRoleJoined);
                            
                            // Never add ourselves to the remote user lists
                            if (userId !== myUserId && userId !== address && userId !== 'me') {
                                if (userRoleJoined === 'host' || userRoleJoined === 'peer') {
                                    addParticipant(userId);
                                    peerManager.callPeer(userId);
                                } else {
                                    addGuest(userId);
                                }
                            }
                            break;
                        case 'user_left':
                            removeParticipant(message.data.userId);
                            removeGuest(message.data.userId);
                            removeRemoteStream(message.data.userId);
                            break;
                        case 'join_request':
                            addJoinRequest(message.data.userId);
                            break;
                        case 'join_approved':
                            if (message.data.userId === myUserId || message.data.userId === address) {
                                setRole('peer');
                                Alert.alert('Request Accepted', 'You are now a performer!');
                                initMediaAndPeers();
                            } else {
                                addParticipant(message.data.userId);
                                removeGuest(message.data.userId);
                            }
                            break;
                        case 'session_ended':
                            Alert.alert('Session Ended', 'The host has ended this karaoke session.');
                            router.replace('/(tabs)/karaoke');
                            break;
                        case 'soundtrack_play':
                            setIsPlaying(true);
                            break;
                        case 'soundtrack_pause':
                            setIsPlaying(false);
                            break;
                    }
                });
                
                ks.connect();
                setSocket(ks);
                setRoomData(room);
            } catch (err) {
                console.error('[Karaoke] Error initializing room:', err);
            }
        };

        const initMediaAndPeers = async () => {
            const { status } = await Audio.requestPermissionsAsync();
            setAudioPermission(status === 'granted');
            await requestCameraPermission();

            if (Platform.OS === 'web' && navigator.mediaDevices) {
                try {
                    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    peerManager.onStream = (peerId, remoteStream) => {
                        addRemoteStream(peerId, remoteStream);
                    };
                    peerManager.initialize(address, localStream);
                } catch (e) {
                    console.error('[Karaoke] Failed to get local stream:', e);
                }
            }
        };

        initRoom();

        return () => {
            isSubscribed = false;
            isInitializedRef.current = false;
            if (socket) {
                socket.disconnect();
            }
            peerManager.destroy();
            leaveRoom();
            if (soundtrack) {
                soundtrack.unloadAsync();
            }
        };
    }, [roomId]); // Only re-run if roomId changes

    // Soundtrack effect
    useEffect(() => {
        if (roomData?.soundtrack_url) {
            loadSoundtrack(roomData.soundtrack_url);
        }
    }, [roomData?.soundtrack_url]);

    useEffect(() => {
        if (soundtrack) {
            if (isPlaying) {
                soundtrack.playAsync();
            } else {
                soundtrack.pauseAsync();
            }
        }
    }, [isPlaying, soundtrack]);

    const loadSoundtrack = async (url: string) => {
        try {
            const { sound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: false }
            );
            setSoundtrack(sound);
        } catch (e) {
            console.error('[Karaoke] Failed to load soundtrack:', e);
        }
    };

    const togglePlayback = () => {
        if (userRole !== 'host') return;
        const newPlaying = !isPlaying;
        setIsPlaying(newPlaying);
        if (socket) {
            socket.sendMessage(newPlaying ? 'soundtrack_play' : 'soundtrack_pause', {});
        }
    };

    const requestToJoin = () => {
        if (socket) {
            socket.sendMessage('join_request', { userId: address });
            Alert.alert('Request Sent', 'Waiting for host to accept...');
        }
    };

    const acceptRequest = (userId: string) => {
        if (socket) {
            socket.sendMessage('join_approved', { userId });
            removeJoinRequest(userId);
        }
    };

    const handleEndSession = async () => {
        Alert.alert(
            'End Session',
            'Are you sure you want to end this karaoke session for everyone?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'End Session', 
                    style: 'destructive',
                    onPress: async () => {
                        if (!roomId) return;
                        try {
                            await karaokeService.endSession(roomId);
                            router.replace('/(tabs)/karaoke');
                        } catch (err) {
                            console.error('[Karaoke] Failed to end session:', err);
                            Alert.alert('Error', 'Failed to end session. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const data = await karaokeService.searchGlobally(searchQuery);
            setSearchResults(data.tracks);
        } catch (err) {
            console.error('[Karaoke] Search failed:', err);
            Alert.alert('Search Error', 'Could not find songs. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const addSongToQueue = async (track: any) => {
        if (!roomId) return;
        try {
            await karaokeService.addToQueue(roomId, track.url); // Use URL or ID depending on API
            Alert.alert('Success', `${track.title} added to queue!`);
            setIsSearchVisible(false);
            setSearchQuery('');
            setSearchResults([]);
        } catch (err) {
            console.error('[Karaoke] Failed to add song:', err);
            Alert.alert('Error', 'Failed to add song to queue.');
        }
    };

    const handleGift = (recipientId: string = 'HOST') => {
        if (!isConnected) {
            Alert.alert(
                'Wallet Required',
                'Connect your Solana wallet to send gifts.',
                [{ text: 'Cancel', style: 'cancel' }, { text: 'View Wallet', onPress: () => router.push('/(tabs)/profile/wallet' as any) }]
            );
            return;
        }
        
        Alert.alert(
            'Send Gift',
            `Gift ${recipientId === 'HOST' ? 'the Host' : 'Participant'}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: '10 RDMZ', 
                    onPress: async () => {
                        const success = await gift(10, recipientId === 'HOST' ? 'HOST_WALLET' : recipientId);
                        if (success) Alert.alert('Gift Sent!', 'Thank you for supporting!');
                    }
                }
            ]
        );
    };

    const renderStream = (id: string | 'me') => {
        if (id === 'me') {
            return cameraPermission?.granted ? (
                <CameraView style={styles.fullscreenVideo} facing="front" />
            ) : (
                <View style={styles.placeholderVideo}>
                    <Ionicons name="camera-outline" size={80} color="#333" />
                    <ThemedText>Camera Off</ThemedText>
                </View>
            );
        }

        const stream = remoteStreams[id];
        if (stream) {
            return (
                <View style={styles.placeholderVideo}>
                    <ThemedText>Streaming: {id.slice(0, 8)}</ThemedText>
                </View>
            );
        }

        return (
            <View style={styles.placeholderVideo}>
                <ThemedText>No Video</ThemedText>
            </View>
        );
    };

  return (
    <ThemedView style={styles.container}>
      {/* Background Video */}
      <View style={styles.backgroundContainer}>
          {activeStreamId ? renderStream(activeStreamId) : (
              <View style={[styles.placeholderVideo, { backgroundColor: '#000' }]}>
                  <ThemedText style={{ color: '#444' }}>Waiting for performers...</ThemedText>
              </View>
          )}
      </View>

      {/* Overlays */}
      <View style={styles.overlay}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
                <ThemedText type="subtitle" style={{ color: '#fff' }}>Karaoke Room</ThemedText>
                <ThemedText style={styles.roomCode}>ID: {roomId}</ThemedText>
            </View>
            <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{userRole === 'host' ? 'HOST' : userRole === 'peer' ? 'PERFORMER' : 'GUEST'}</ThemedText>
            </View>
            <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <ThemedText style={styles.liveIndicatorText}>{guests.length + participants.length + 1}</ThemedText>
            </View>
        </View>

        {/* Small switches for participants */}
        <View style={styles.streamSwitcher}>
            <TouchableOpacity 
                style={[styles.miniThumb, activeStreamId === 'me' && styles.miniThumbActive]} 
                onPress={() => setActiveStream('me')}
            >
                <ThemedText style={styles.miniText}>You</ThemedText>
            </TouchableOpacity>
            {participants.filter(p => p !== 'me').map(id => (
                <TouchableOpacity 
                    key={id} 
                    style={[styles.miniThumb, activeStreamId === id && styles.miniThumbActive]} 
                    onPress={() => setActiveStream(id)}
                >
                    <ThemedText style={styles.miniText}>{id.slice(0, 4)}</ThemedText>
                </TouchableOpacity>
            ))}
        </View>

        <View style={styles.lyricsContainer}>
            {currentSong ? (
                <>
                    <ThemedText style={styles.lyrics}>"I'm blinded by the lights..."</ThemedText>
                    <ThemedText style={styles.songTitle}>{currentSong.title}</ThemedText>
                </>
            ) : (
                <ThemedText style={{ color: 'rgba(255,255,255,0.5)' }}>Pick a song to start!</ThemedText>
            )}
        </View>

        {/* Action Notifications (Host Only) */}
        {userRole === 'host' && pendingRequests.length > 0 && (
            <View style={styles.requestToast}>
                <ThemedText style={styles.toastText}>{pendingRequests.length} join requests</ThemedText>
                <Button 
                    title="View" 
                    onPress={() => {
                        Alert.alert('Join Requests', 'Users want to perform:', 
                            pendingRequests.map(id => ({ text: `Accept ${id.slice(0, 6)}`, onPress: () => acceptRequest(id) }))
                        );
                    }} 
                />
            </View>
        )}

        <View style={styles.footer}>
            <View style={styles.controls}>
                {userRole === 'guest' ? (
                    <TouchableOpacity style={styles.joinHostButton} onPress={requestToJoin}>
                        <Ionicons name="videocam" size={20} color="#fff" />
                        <ThemedText style={styles.joinHostText}>Go Live with Host</ThemedText>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity 
                            style={[styles.controlButton, !isMicOn && styles.controlButtonOff]} 
                            onPress={() => setIsMicOn(!isMicOn)}
                        >
                            <Ionicons name={isMicOn ? "mic" : "mic-off"} size={24} color="#fff" />
                        </TouchableOpacity>

                        {userRole === 'host' && (
                            <>
                                <TouchableOpacity style={styles.controlButton} onPress={() => setIsSearchVisible(true)}>
                                    <Ionicons name="search" size={24} color="#fff" />
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.controlButton, isPlaying && { borderColor: Colors.dark.primary }]} 
                                    onPress={togglePlayback}
                                >
                                    <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
                                </TouchableOpacity>
                            </>
                        )}
                    </>
                )}
                
                <TouchableOpacity style={styles.controlButton} onPress={() => handleGift(activeStreamId || 'HOST')}>
                    <Ionicons name="gift-outline" size={24} color={Colors.dark.primary} />
                </TouchableOpacity>

                {userRole === 'host' ? (
                    <TouchableOpacity style={[styles.controlButton, { backgroundColor: '#ff4444' }]} onPress={handleEndSession}>
                        <Ionicons name="stop" size={24} color="#fff" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={[styles.controlButton, { backgroundColor: '#444' }]} onPress={() => router.back()}>
                        <Ionicons name="log-out-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        </View>

        {/* Global Search Modal (Simplified Overlay for now) */}
        {isSearchVisible && (
            <View style={styles.searchOverlay}>
                <View style={styles.searchContent}>
                    <View style={styles.searchHeader}>
                        <ThemedText type="subtitle">Add Song to Queue</ThemedText>
                        <TouchableOpacity onPress={() => setIsSearchVisible(false)}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.searchInputContainer}>
                        <TextInput 
                            style={styles.searchInput}
                            placeholder="Search YouTube/SoundCloud..."
                            placeholderTextColor="#666"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                        />
                        <TouchableOpacity style={styles.searchIcon} onPress={handleSearch}>
                            {isSearching ? (
                                <View style={{ padding: 5 }}><ThemedText>...</ThemedText></View>
                            ) : (
                                <Ionicons name="search" size={24} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.searchList}>
                        {searchResults.map((track, idx) => (
                            <TouchableOpacity 
                                key={idx} 
                                style={styles.searchItem} 
                                onPress={() => addSongToQueue(track)}
                            >
                                <Ionicons name="musical-note" size={20} color={Colors.dark.primary} />
                                <View style={{ marginLeft: 15, flex: 1 }}>
                                    <ThemedText style={{ color: '#fff' }}>{track.title}</ThemedText>
                                    <ThemedText style={{ color: '#666', fontSize: 12 }}>{track.duration}</ThemedText>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundContainer: {
      ...StyleSheet.absoluteFillObject,
  },
  fullscreenVideo: {
      flex: 1,
  },
  placeholderVideo: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#111',
  },
  overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'space-between',
      paddingTop: 60,
      paddingBottom: Platform.OS === 'ios' ? 60 : 40, // More padding to clear nav bar
  },
  header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
  },
  backButton: {
      padding: 5,
  },
  roomCode: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.6)',
      marginTop: 2,
  },
  badge: {
      backgroundColor: Colors.dark.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
  },
  badgeText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#fff',
  },
  streamSwitcher: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 10,
      marginTop: 20,
  },
  miniThumb: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
  },
  miniThumbActive: {
      borderColor: Colors.dark.primary,
      borderWidth: 2,
  },
  miniText: {
      fontSize: 10,
      color: '#fff',
  },
  lyricsContainer: {
      flex: 1,
      padding: 40,
      justifyContent: 'center',
      alignItems: 'center',
  },
  lyrics: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
      textShadowColor: 'rgba(0,0,0,0.8)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 10,
  },
  songTitle: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.7)',
      marginTop: 20,
  },
  requestToast: {
      position: 'absolute',
      top: 130,
      left: 20,
      right: 20,
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: 15,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: Colors.dark.primary,
  },
  toastText: {
      color: '#fff',
      fontWeight: '600',
  },
  footer: {
      paddingHorizontal: 20,
      width: '100%',
  },
  controls: {
      flexDirection: 'row',
      gap: 15,
      alignItems: 'center',
  },
  controlButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(255,255,255,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
  },
  joinHostButton: {
      flex: 1,
      height: 50,
      borderRadius: 25,
      backgroundColor: Colors.dark.primary,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
  },
  joinHostText: {
      color: '#fff',
      fontWeight: 'bold',
  },
  liveIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 10,
      gap: 6,
  },
  liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#ff4444',
  },
  liveIndicatorText: {
      fontSize: 12,
      color: '#fff',
      fontWeight: 'bold',
  },
  controlButtonOff: {
      backgroundColor: '#ff4444',
      borderColor: '#ff4444',
  },
  searchOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.95)',
      paddingTop: 60,
  },
  searchContent: {
      flex: 1,
      padding: 20,
  },
  searchHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
  },
  searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 12,
      paddingHorizontal: 15,
      marginBottom: 20,
  },
  searchInput: {
      flex: 1,
      height: 50,
      color: '#fff',
      fontSize: 16,
  },
  searchIcon: {
      padding: 5,
  },
  searchList: {
      flex: 1,
  },
  searchItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 0.5,
      borderBottomColor: 'rgba(255,255,255,0.1)',
  }
});
