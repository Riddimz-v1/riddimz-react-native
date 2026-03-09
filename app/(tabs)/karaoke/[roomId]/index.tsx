import { StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUserStore } from '@/stores/user';
import { ThemedView } from '@/components/atoms/ThemedView';
import { useEffect, useRef, useState, useCallback } from 'react';
import { KaraokeSocket } from '@/services/realtime/karaokeSocket';
import { Colors } from '@/utils/constants';
import { useKaraokeStore, UserRole } from '@/stores/karaoke';
import { karaokeService } from '@/services/api/karaoke';
import { peerManager } from '@/services/realtime/peerManager';
import { useWallet } from '@/hooks/useWallet';
import { ChatMessage } from '@/components/organisms/Karaoke/ChatPanel';
import { HostView } from '@/components/organisms/Karaoke/HostView';
import { ParticipantView } from '@/components/organisms/Karaoke/ParticipantView';
import { GuestView } from '@/components/organisms/Karaoke/GuestView';
import { useNotificationStore } from '@/stores/notifications';
import { RealtimeToastContainer } from '@/components/molecules/RealtimeToast';

export default function KaraokeRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router     = useRouter();
  const { profile, fetchProfile } = useUserStore();
  const { address } = useWallet();

  useEffect(() => {
    if (!profile) fetchProfile();
  }, [profile, fetchProfile]);

  // ── Zustand — selective subscriptions (existing pattern) ──────────────────
  const currentSong       = useKaraokeStore(s => s.currentSong);
  const participants      = useKaraokeStore(s => s.participants);
  const guests            = useKaraokeStore(s => s.guests);
  const remoteStreams     = useKaraokeStore(s => s.remoteStreams);
  const userRole          = useKaraokeStore(s => s.userRole);
  const activeStreamId    = useKaraokeStore(s => s.activeStreamId);
  const pendingRequests   = useKaraokeStore(s => s.pendingRequests);

  const setSong           = useKaraokeStore(s => s.setSong);
  const joinRoom          = useKaraokeStore(s => s.joinRoom);
  const leaveRoom         = useKaraokeStore(s => s.leaveRoom);
  const addParticipant    = useKaraokeStore(s => s.addParticipant);
  const removeParticipant = useKaraokeStore(s => s.removeParticipant);
  const addGuest          = useKaraokeStore(s => s.addGuest);
  const removeGuest       = useKaraokeStore(s => s.removeGuest);
  const addRemoteStream   = useKaraokeStore(s => s.addRemoteStream);
  const removeRemoteStream= useKaraokeStore(s => s.removeRemoteStream);
  const addJoinRequest    = useKaraokeStore(s => s.addJoinRequest);
  const removeJoinRequest = useKaraokeStore(s => s.removeJoinRequest);
  const setActiveStream   = useKaraokeStore(s => s.setActiveStream);
  const setRole           = useKaraokeStore(s => s.setRole);

  const addNotification   = useNotificationStore(s => s.addNotification);

  const [socket, setSocket]   = useState<KaraokeSocket | null>(null);
  const socketRef = useRef<KaraokeSocket | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const isInitRef = useRef(false);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const addSystemMessage = useCallback((text: string) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), userId: 'system', displayName: '', text, timestamp: Date.now(), type: 'system' },
    ]);
  }, []);

  // ── Init (matches existing pattern exactly) ───────────────────────────────
  useEffect(() => {
    if (!roomId || !profile?.id || isInitRef.current) return;
    isInitRef.current = true;
    let isSubscribed  = true;

    const initRoom = async () => {
      try {
        console.log('[Karaoke] Initializing room with ID:', roomId);
        let room;
        
        try {
          room = await karaokeService.getRoom(roomId);
        } catch (e) {
          console.warn('[Karaoke] getRoom(id) failed, falling back to list find...', e);
          const allRooms = await karaokeService.getRooms();
          console.log('[Karaoke] All rooms list:', allRooms.map(r => ({ id: r.id, name: r.name })));
          room = allRooms.find(r => String(r.id) === String(roomId));
        }

        console.log('[Karaoke] Room matched:', room);

        if (!room) {
          Alert.alert('Error', 'Room not found.');
          router.replace('/(tabs)/karaoke');
          return;
        }

        if (!isSubscribed) return;

        const myId = profile.id.toString();
        const myWallet = address?.toLowerCase();
        
        console.log('[Karaoke] Role Check:', {
          hostId: room.host_id,
          myId,
          myWallet,
          participants: room.current_participants
        });

        let role: UserRole = 'guest';
        const isHost = String(room.host_id) === myId || 
                      (myWallet && String(room.host_id).toLowerCase() === myWallet);

        if (isHost) {
          role = 'host';
        } else {
          // Check if user is already a peer (performer)
          const isPeer = room.current_participants?.some((p: any) => 
            String(p) === myId || (myWallet && String(p).toLowerCase() === myWallet)
          );
          if (isPeer) {
            role = 'peer';
          }
        }

        console.log('[Karaoke] Assigned Role:', role);

        // 1. Sync store state
        await joinRoom(roomId, role);
        
        // Add other existing participants to store
        room.current_participants?.forEach((uid: string) => {
          if (uid !== myId && uid !== myWallet) {
            addParticipant(uid);
          }
        });

        // 2. Setup PeerManager
        peerManager.onStream = (userId, stream) => {
          console.log('[Karaoke] Received remote stream from:', userId);
          addRemoteStream(userId, stream);
        };

        if (role === 'host' || role === 'peer') {
          peerManager.initialize(myId);
        }

        // 3. Setup Socket
        const ks = new KaraokeSocket(roomId, (message) => {
          switch (message.event) {
            case 'track_change':
              setSong(message.data);
              break;
            case 'user_joined':
              const { userId, role: userRoleJoined } = message.data;
              const isMe = userId === myId || (myWallet && userId.toLowerCase() === myWallet);
              
              if (!isMe) {
                if (userRoleJoined === 'host' || userRoleJoined === 'peer') {
                   addParticipant(userId);
                   peerManager.callPeer(userId);
                   addNotification('performer_added', `${userId.slice(0, 6)}… is performing!`);
                } else {
                  addGuest(userId);
                }
                addSystemMessage(`${userId.slice(0, 6)}… joined`);
              }
              break;
            case 'user_left':
              removeParticipant(message.data.userId);
              removeGuest(message.data.userId);
              removeRemoteStream(message.data.userId);
              addSystemMessage(`${message.data.userId.slice(0, 6)}… left`);
              break;
            case 'join_request':
              addJoinRequest(message.data.userId);
              addNotification('join_request', `${message.data.userId.slice(0, 6)}… wants to sing!`);
              break;
            case 'join_approved':
              const approvedId = message.data.userId;
              const isMeApproved = approvedId === myId || (myWallet && approvedId.toLowerCase() === myWallet);
              
              if (isMeApproved) {
                setRole('peer');
                peerManager.initialize(myId); // Initialize as performer
                Alert.alert('Accepted! 🎤', 'You can now perform live.');
              } else {
                addParticipant(approvedId);
                removeGuest(approvedId);
                addNotification('join_approved', `${approvedId.slice(0, 6)}… is now a performer!`);
              }
              removeJoinRequest(approvedId);
              break;
            case 'gift':
              addNotification('gift', `${message.data.senderId?.slice(0, 6) ?? 'Someone'} sent a gift! 🎁`);
              break;
            case 'chat':
              setMessages(prev => [
                ...prev,
                {
                  id: Date.now().toString(),
                  userId:      message.data.userId ?? 'anon',
                  displayName: message.data.displayName ?? message.data.userId?.slice(0, 6) ?? 'Anon',
                  text:        message.data.text,
                  timestamp:   Date.now(),
                  type:        'chat',
                },
              ]);
              break;
            case 'session_ended':
              Alert.alert('Session Ended', 'The host has ended this karaoke session.');
              router.replace('/(tabs)/karaoke');
              break;
          }
        });

        await ks.connect();
        setSocket(ks);
        socketRef.current = ks;
      } catch (err) {
        console.error('[Karaoke] Error initializing room:', err);
      }
    };

    initRoom();

    return () => {
      isSubscribed = false;
      isInitRef.current = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
      peerManager.destroy();
      leaveRoom();
    };
  }, [roomId, profile?.id]);

  // ── Shared callbacks ───────────────────────────────────────────────────────
  const handleSendMessage = useCallback((text: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      userId: profile?.id?.toString() ?? 'me',
      displayName: profile?.username ?? 'Me',
      text,
      timestamp: Date.now(),
      type: 'chat',
    };
    setMessages(prev => [...prev, msg]);
    socket?.sendMessage('chat', {
      userId:      profile?.id?.toString() ?? 'anon',
      displayName: profile?.username,
      text,
    });
  }, [socket, profile]);

  const handleToggleMic = useCallback(() => setIsMicOn(v => !v), []);

  const handleEndSession = useCallback(() => {
    Alert.alert(
      'End Session?',
      'This will end the session for everyone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            try {
              await karaokeService.endSession(roomId);
              router.replace('/(tabs)/karaoke');
            } catch {
              Alert.alert('Error', 'Could not end session.');
            }
          },
        },
      ]
    );
  }, [roomId, router]);

  const handleAcceptRequest = useCallback((uid: string) => {
    socket?.sendMessage('join_approved', { userId: uid });
    removeJoinRequest(uid);
  }, [socket, removeJoinRequest]);

 const handleRequestToJoin = useCallback(() => {
  if (!address) {
    Alert.alert('Error', 'Wallet not connected.');
    return;
  }

  socket?.sendMessage('join_request', { userId: address });

  Alert.alert('Request Sent 🎤', 'Waiting for the host to accept…');
}, [socket, address]);

  const handleLeave = useCallback(() => {
    Alert.alert('Leave Room?', '', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => router.replace('/(tabs)/karaoke') },
    ]);
  }, [router]);

  if (userRole === 'host') {
    return (
      <>
        <HostView
          roomId={roomId}
          socket={socket}
          messages={messages}
          onSendMessage={handleSendMessage}
          isMicOn={isMicOn}
          onToggleMic={handleToggleMic}
          onEndSession={handleEndSession}
          participants={participants}
          guests={guests}
          pendingRequests={pendingRequests}
          onAcceptRequest={handleAcceptRequest}
          currentSong={currentSong}
        />
        <RealtimeToastContainer />
      </>
    );
  }

  if (userRole === 'peer') {
    return (
      <>
        <ParticipantView
          messages={messages}
          onSendMessage={handleSendMessage}
          isMicOn={isMicOn}
          onToggleMic={handleToggleMic}
          onLeave={handleLeave}
          currentSong={currentSong}
        />
        <RealtimeToastContainer />
      </>
    );
  }

  return (
    <>
      <GuestView
        socket={socket}
        messages={messages}
        onSendMessage={handleSendMessage}
        participants={participants}
        guests={guests}
        activeStreamId={activeStreamId}
        onSwitchStream={setActiveStream}
        onRequestToJoin={handleRequestToJoin}
        currentSong={currentSong}
        onLeave={handleLeave}
      />
      <RealtimeToastContainer />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
