import {
  StyleSheet,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/utils/constants';
import { useRef, useState, useEffect } from 'react';

const PRIMARY = Colors.dark.primary;

export interface ChatMessage {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  timestamp: number;
  type: 'chat' | 'gift' | 'system';
  giftAmount?: number;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  placeholder?: string;
}

const ChatBubble = ({ msg }: { msg: ChatMessage }) => {
  if (msg.type === 'gift') {
    return (
      <View style={styles.giftRow}>
        <Ionicons name="gift" size={13} color="#FFD700" />
        <ThemedText style={styles.giftText}>
          <ThemedText style={styles.giftName}>{msg.displayName}</ThemedText>
          {' sent '}
          <ThemedText style={styles.giftAmount}>{msg.giftAmount} RDMZ 🎁</ThemedText>
        </ThemedText>
      </View>
    );
  }

  if (msg.type === 'system') {
    return <ThemedText style={styles.systemText}>{msg.text}</ThemedText>;
  }

  return (
    <View style={styles.chatRow}>
      <ThemedText style={styles.chatName}>{msg.displayName} </ThemedText>
      <ThemedText style={styles.chatText}>{msg.text}</ThemedText>
    </View>
  );
};

export function ChatPanel({ messages, onSend, placeholder = 'Say something...' }: ChatPanelProps) {
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={({ item }) => <ChatBubble msg={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#444"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={15} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  listContent:      { padding: 12, gap: 4 },

  giftRow:          { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 3 },
  giftText:         { fontSize: 12, color: '#bbb' },
  giftName:         { color: PRIMARY, fontWeight: 'bold' },
  giftAmount:       { color: '#FFD700', fontWeight: 'bold' },

  systemText:       { fontSize: 11, color: '#444', fontStyle: 'italic', paddingVertical: 2 },

  chatRow:          { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 2 },
  chatName:         { fontSize: 12, color: PRIMARY, fontWeight: 'bold' },
  chatText:         { fontSize: 12, color: 'rgba(255,255,255,0.8)' },

  inputRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderTopWidth: 1, borderTopColor: '#1e1e1e' },
  input:            { flex: 1, height: 40, backgroundColor: '#1a1a1a', borderRadius: 20, paddingHorizontal: 14, color: '#fff', fontSize: 14 },
  sendBtn:          { width: 36, height: 36, borderRadius: 18, backgroundColor: PRIMARY, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled:  { opacity: 0.35 },
});