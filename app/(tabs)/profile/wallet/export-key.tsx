import { StyleSheet, View, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { Button } from '@/components/atoms/Button';
import { ThemedTextInput } from '@/components/atoms/ThemedTextInput';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { restClient } from '@/services/api/restClient';

export default function ExportKeyScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [privateKey, setPrivateKey] = useState<string | null>(null);
    const [revealed, setRevealed] = useState(false);

    const handleExport = async () => {
        if (!password) {
            Alert.alert('Error', 'Please enter your password');
            return;
        }

        setLoading(true);
        try {
            // Adjust endpoint if necessary, API docs say GET with query param usually bad practice for sensitive data
            // but docs say GET /auth/export-key?password=...
            const response = await restClient.get<{ private_key: string }>(`/auth/export-key?password=${encodeURIComponent(password)}`);
            setPrivateKey(response.private_key);
        } catch (error: any) {
             Alert.alert('Error', error.message || 'Failed to export key');
        } finally {
            setLoading(false);
        }
    };

    const copyKey = async () => {
        if (privateKey) {
            await Clipboard.setStringAsync(privateKey);
            Alert.alert('Copied', 'Private key copied to clipboard');
        }
    };

    return (
        <ThemedView style={styles.container}>
             <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="title">Export Private Key</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <ThemedText style={styles.warning}>
                    WARNING: Never share your private key with anyone. Anyone with this key can steal your funds.
                </ThemedText>

                {!privateKey ? (
                    <>
                        <ThemedTextInput
                            label="Confirm Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        <Button 
                            title="Reveal Key" 
                            onPress={handleExport} 
                            isLoading={loading}
                            style={{ marginTop: 20, borderColor: '#ff4444' }}
                            variant="outline"
                        />
                    </>
                ) : (
                    <View style={styles.keyContainer}>
                        <ThemedText style={styles.label}>Your Private Key</ThemedText>
                        <View style={styles.keyBox}>
                            <ThemedText style={styles.keyText}>
                                {revealed ? privateKey : '•'.repeat(privateKey.length)}
                            </ThemedText>
                        </View>
                        
                        <View style={styles.actions}>
                             <TouchableOpacity onPress={() => setRevealed(!revealed)} style={styles.actionButton}>
                                <Ionicons name={revealed ? "eye-off" : "eye"} size={20} color={colors.text} />
                                <ThemedText>{revealed ? 'Hide' : 'Show'}</ThemedText>
                             </TouchableOpacity>

                             <TouchableOpacity onPress={copyKey} style={styles.actionButton}>
                                <Ionicons name="copy-outline" size={20} color={colors.text} />
                                <ThemedText>Copy</ThemedText>
                             </TouchableOpacity>
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    content: {
        padding: 20,
    },
    warning: {
        color: '#ff4444',
        marginBottom: 30,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    keyContainer: {
        marginTop: 20,
    },
    label: {
        marginBottom: 10,
        opacity: 0.7,
    },
    keyBox: {
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        marginBottom: 20,
    },
    keyText: {
        fontFamily: 'monospace',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 30,
    },
    actionButton: {
         flexDirection: 'row',
         alignItems: 'center',
         gap: 8,
    }
});
