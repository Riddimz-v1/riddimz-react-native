import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { useRouter } from 'expo-router';
import { Button } from '@/components/atoms/Button';

import { useState } from 'react';
import { View, TextInput, Switch } from 'react-native';
import { karaokeService } from '@/services/api/karaoke';
import { useTheme } from '@/hooks/useTheme';

export default function CreateRoomScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [name, setName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) return;
        setLoading(true);
        try {
            const room = await karaokeService.createRoom({
                name,
                is_private: isPrivate,
            });
            router.replace(`/(tabs)/karaoke/${room.id}`);
        } catch (error) {
            console.error('Error creating karaoke room:', error);
        } finally {
            setLoading(false);
        }
    };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title">Create Room</ThemedText>
        
        <View style={styles.field}>
            <ThemedText style={styles.label}>Room Name</ThemedText>
            <TextInput 
                style={[styles.input, { color: colors.text, borderColor: colors.secondary }]}
                placeholder="Awesome Karaoke Party"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
            />
        </View>

        <View style={styles.row}>
            <View>
                <ThemedText type="defaultSemiBold">Private Room</ThemedText>
                <ThemedText style={styles.help}>Only people with the link can join</ThemedText>
            </View>
            <Switch 
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ true: colors.primary }}
            />
        </View>

        <View style={styles.actions}>
            <Button title="Create Room" onPress={handleCreate} isLoading={loading} />
            <Button title="Back" variant="outline" onPress={() => router.back()} />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    gap: 30,
  },
  field: {
    gap: 10,
  },
  label: {
      fontSize: 14,
      color: '#999',
  },
  input: {
      height: 50,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  help: {
      fontSize: 12,
      color: '#666',
      marginTop: 2,
  },
  actions: {
    gap: 12,
  },
});
