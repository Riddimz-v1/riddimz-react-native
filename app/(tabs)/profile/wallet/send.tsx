import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { Button } from '@/components/atoms/Button';
import { ThemedTextInput } from '@/components/atoms/ThemedTextInput';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '@/hooks/useWallet';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { Colors } from '@/utils/constants';

type TokenType = 'rdmz' | 'sol' | 'usdt';

export default function SendScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { balances, send } = useWallet();
    
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState<TokenType>('rdmz');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!recipient || !amount) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            Alert.alert('Error', 'Invalid amount');
            return;
        }

        if (amountNum > balances[selectedToken]) {
            Alert.alert('Error', 'Insufficient balance');
            return;
        }

        setLoading(true);
        const success = await send(amountNum, recipient, selectedToken);
        setLoading(false);

        if (success) {
            Alert.alert('Success', 'Transaction sent successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } else {
            Alert.alert('Error', 'Transaction failed. Please try again.');
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="title">Send {selectedToken.toUpperCase()}</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.tokenSelector}>
                    {(['rdmz', 'sol', 'usdt'] as TokenType[]).map((token) => (
                        <TouchableOpacity 
                            key={token}
                            style={[
                                styles.tokenOption, 
                                selectedToken === token && { backgroundColor: colors.primary }
                            ]}
                            onPress={() => setSelectedToken(token)}
                        >
                            <ThemedText style={{ color: selectedToken === token ? '#fff' : colors.text }}>
                                {token.toUpperCase()}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>

                <ThemedText style={styles.balanceLabel}>
                    Available: {balances[selectedToken].toFixed(4)} {selectedToken.toUpperCase()}
                </ThemedText>

                <ThemedTextInput
                    label="Recipient Address"
                    placeholder="Enter wallet address"
                    value={recipient}
                    onChangeText={setRecipient}
                />

                <ThemedTextInput
                    label="Amount"
                    placeholder="0.00"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                />

                <Button 
                    title="Send" 
                    onPress={handleSend} 
                    isLoading={loading}
                    style={{ marginTop: 20 }}
                />
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
    tokenSelector: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 4,
    },
    tokenOption: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    balanceLabel: {
        marginBottom: 20,
        opacity: 0.7,
        fontSize: 14,
    }
});
