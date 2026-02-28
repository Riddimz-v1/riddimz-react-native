import {
  StyleSheet,
  View,
  Animated,
} from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/utils/constants';
import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '@/components/organisms/Karaoke/ChatPanel';

const PRIMARY = Colors.dark.primary;
const MAX_VISIBLE = 6; // max comments shown at once over video

interface AnimatedComment extends ChatMessage {
  anim: Animated.Value; // opacity + translateY
}

interface CommentStreamProps {
  messages: ChatMessage[];
}

/**
 * Renders the last MAX_VISIBLE messages as a floating overlay on the video.
 * New comments fade in and the oldest fade out — TikTok Live style.
 */
export function CommentStream({ messages }: CommentStreamProps) {
  const [visible, setVisible] = useState<AnimatedComment[]>([]);
  const prevLenRef = useRef(0);

  useEffect(() => {
    if (messages.length === prevLenRef.current) return;
    prevLenRef.current = messages.length;

    const latest = messages[messages.length - 1];
    if (!latest || latest.type === 'system') return;

    const anim = new Animated.Value(0);

    setVisible(prev => {
      const next = [
        ...prev.slice(-(MAX_VISIBLE - 1)),
        { ...latest, anim },
      ];
      return next;
    });

    // Fade + slide in
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();

    // Auto-fade out after 6 s
    const timer = setTimeout(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setVisible(prev => prev.filter(m => m.id !== latest.id));
      });
    }, 6000);

    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <View style={styles.container} pointerEvents="none">
      {visible.map((msg) => (
        <Animated.View
          key={msg.id}
          style={[
            styles.bubble,
            {
              opacity: msg.anim,
              transform: [{
                translateY: msg.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              }],
            },
          ]}
        >
          {msg.type === 'gift' ? (
            <View style={styles.giftBubble}>
              <Ionicons name="gift" size={13} color="#FFD700" />
              <ThemedText style={styles.giftName}>{msg.displayName}</ThemedText>
              <ThemedText style={styles.giftAmount}> sent {msg.giftAmount} RDMZ 🎁</ThemedText>
            </View>
          ) : (
            <View style={styles.chatBubble}>
              <ThemedText style={styles.name}>{msg.displayName}</ThemedText>
              <ThemedText style={styles.text}> {msg.text}</ThemedText>
            </View>
          )}
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Sits on top of video, bottom-left, above the bottom panel
  container: {
    position: 'absolute',
    bottom: 270,     // clear of the bottom panel
    left: 12,
    right: 80,       // leave right side clear for controls
    gap: 6,
    justifyContent: 'flex-end',
  },

  bubble: {
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },

  chatBubble: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },

  giftBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,215,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },

  name:        { fontSize: 12, color: PRIMARY, fontWeight: 'bold' },
  text:        { fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  giftName:    { fontSize: 12, color: '#FFD700', fontWeight: 'bold' },
  giftAmount:  { fontSize: 12, color: '#FFD700' },
});