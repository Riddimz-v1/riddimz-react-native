import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '@/hooks/useWallet';
import { useTheme } from '@/hooks/useTheme';
import * as Clipboard from 'expo-clipboard';

// Placeholder for QR Code (install react-native-qrcode-svg if needed)
const QRCodePlaceholder = () => (
    <View style={{ width: 200, height: 200, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText style={{ color: '#000', fontWeight: 'bold' }}>QR Code</ThemedText>
    </View>
);

export default function ReceiveScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { address } = useWallet();

    const copyAddress = async () => {
        if (address) {
            await Clipboard.setStringAsync(address);
            Alert.alert('Copied', 'Wallet address copied to clipboard');
        }
    };

    return (
        <ThemedView style={styles.container}>
             <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="title">Receive</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.qrContainer}>
                    <QRCodePlaceholder />
                </View>

                <View style={styles.addressBox}>
                    <ThemedText style={styles.addressLabel}>Your Wallet Address</ThemedText>
                    <ThemedText style={styles.address}>{address || 'Loading...'}</ThemedText>
                    <TouchableOpacity onPress={copyAddress} style={styles.copyButton}>
                         <Ionicons name="copy-outline" size={20} color={colors.primary} />
                         <ThemedText style={{ color: colors.primary }}>Copy Address</ThemedText>
                    </TouchableOpacity>
                </View>

                <ThemedText style={styles.notice}>
                    Send only supported tokens (SOL, RDMZ, USDT) to this address. Sending other tokens may result in permanent loss.
                </ThemedText>
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
        alignItems: 'center',
    },
    qrContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 30,
    },
    addressBox: {
        width: '100%',
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
    },
    addressLabel: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 8,
    },
    address: {
        fontSize: 16,
        fontFamily: 'monospace',
        textAlign: 'center',
        marginBottom: 16,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
    },
    notice: {
        fontSize: 12,
        opacity: 0.5,
        textAlign: 'center',
        paddingHorizontal: 20,
    }
});
