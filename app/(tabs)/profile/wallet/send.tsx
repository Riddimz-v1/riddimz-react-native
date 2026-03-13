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
import { Colors, BRAND_GRADIENT } from '@/utils/constants';
import { LinearGradient } from 'expo-linear-gradient';

type TokenType = 'rdmz' | 'sol' | 'usdt';
type NetworkType = 'Solana' | 'Ethereum' | 'BSC' | 'Polygon';

export default function SendScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { balances, send } = useWallet();
    
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedToken, setSelectedToken] = useState<TokenType>('rdmz');
    const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>('Solana');
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
        if (selectedNetwork !== 'Solana') {
            Alert.alert('Not Supported', `Sending to ${selectedNetwork} is not yet supported in this version. Currently only Solana network is available.`);
            setLoading(false);
            return;
        }

        const success = await send(amountNum, recipient, selectedToken, selectedNetwork);
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
                <View>
                    <ThemedText type="title">Send {selectedToken.toUpperCase()}</ThemedText>
                    <ThemedText style={[styles.networkSubheader, { color: colors.primary }]}>on Solana Network</ThemedText>
                </View>
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

                <ThemedText style={styles.sectionLabel}>Recipient Network</ThemedText>
                <View style={styles.networkSelector}>
                    {(['Solana', 'Ethereum', 'BSC', 'Polygon'] as NetworkType[]).map((network) => {
                        const isSelected = selectedNetwork === network;
                        return (
                            <TouchableOpacity 
                                key={network}
                                onPress={() => setSelectedNetwork(network)}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={isSelected ? BRAND_GRADIENT as any : ['transparent', 'transparent']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.gradientBorder}
                                >
                                    <View style={[
                                        styles.networkOptionInner, 
                                        !isSelected && { borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }
                                    ]}>
                                        <ThemedText style={{ 
                                            fontSize: 12, 
                                            color: isSelected ? colors.primary : colors.text,
                                            fontWeight: isSelected ? 'bold' : 'normal'
                                        }}>
                                            {network}
                                        </ThemedText>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        );
                    })}
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
    },
    networkSubheader: {
        fontSize: 10,
        opacity: 0.6,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: -4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionLabel: {
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 8,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    networkSelector: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 20,
    },
    gradientBorder: {
        padding: 1.5, // Border width
        borderRadius: 20,
    },
    networkOptionInner: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 18.5, // padding + inner radius = outer radius (20)
        backgroundColor: Colors.dark.background,
        minWidth: 65,
        alignItems: 'center',
    }
});
