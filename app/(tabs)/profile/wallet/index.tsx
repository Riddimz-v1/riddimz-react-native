import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { Button } from '@/components/atoms/Button';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '@/hooks/useWallet';
import { useTheme } from '@/hooks/useTheme';
import { Colors } from '@/utils/constants';
import { useEffect, useState } from 'react';

export default function WalletScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { balances, address, refreshBalances } = useWallet();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        refreshBalances();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshBalances();
        setRefreshing(false);
    };

    const getUsdValue = () => {
        // Placeholder rates
        const rates = { sol: 145.50, rdmz: 0.10, usdt: 1.00 };
        const total = (balances.sol * rates.sol) + (balances.rdmz * rates.rdmz) + (balances.usdt * rates.usdt);
        return total.toFixed(2);
    };

    const formatAddress = (addr: string | null) => {
        if (!addr) return '...';
        return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="title">Wallet</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                <View style={[styles.balanceCard, { backgroundColor: colors.secondary }]}>
                    <ThemedText style={styles.label}>Total Balance</ThemedText>
                    <ThemedText style={styles.totalAmount}>${getUsdValue()}</ThemedText>
                    <View style={styles.addressContainer}>
                        <ThemedText style={styles.address}>{formatAddress(address)}</ThemedText>
                        <TouchableOpacity>
                            <Ionicons name="copy-outline" size={16} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/profile/wallet/send' as any)}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                            <Ionicons name="arrow-up" size={24} color="#fff" />
                        </View>
                        <ThemedText style={styles.actionLabel}>Send</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/profile/wallet/receive' as any)}>
                         <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                            <Ionicons name="arrow-down" size={24} color="#fff" />
                        </View>
                        <ThemedText style={styles.actionLabel}>Receive</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                         <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
                            <Ionicons name="swap-horizontal" size={24} color="#fff" />
                        </View>
                        <ThemedText style={styles.actionLabel}>Swap</ThemedText>
                    </TouchableOpacity>
                </View>

                <ThemedText type="subtitle" style={styles.sectionTitle}>Assets</ThemedText>

                <View style={styles.assetList}>
                    <View style={[styles.assetItem, { borderBottomColor: colors.secondary }]}>
                        <View style={styles.assetInfo}>
                            <View style={[styles.assetIcon, { backgroundColor: '#00FFA3' }]}>
                                <ThemedText style={styles.assetIconText}>S</ThemedText>
                            </View>
                            <View>
                                <ThemedText style={styles.assetName}>Solana</ThemedText>
                                <View style={styles.symbolRow}>
                                    <ThemedText style={styles.assetSymbol}>SOL</ThemedText>
                                    <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 2 }} />
                                    <ThemedText style={styles.networkLabel}>Solana</ThemedText>
                                </View>
                            </View>
                        </View>
                        <View style={styles.assetBalance}>
                             <ThemedText style={styles.balanceText}>{balances.sol.toFixed(4)}</ThemedText>
                             <ThemedText style={styles.valueText}>${(balances.sol * 145.50).toFixed(2)}</ThemedText>
                        </View>
                    </View>

                     <View style={[styles.assetItem, { borderBottomColor: colors.secondary }]}>
                        <View style={styles.assetInfo}>
                            <View style={[styles.assetIcon, { backgroundColor: '#7633b5' }]}>
                                <ThemedText style={styles.assetIconText}>R</ThemedText>
                            </View>
                            <View>
                                <ThemedText style={styles.assetName}>Riddimz</ThemedText>
                                <View style={styles.symbolRow}>
                                    <ThemedText style={styles.assetSymbol}>RDMZ</ThemedText>
                                    <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 2 }} />
                                    <ThemedText style={styles.networkLabel}>Solana</ThemedText>
                                </View>
                            </View>
                        </View>
                         <View style={styles.assetBalance}>
                             <ThemedText style={styles.balanceText}>{balances.rdmz.toFixed(2)}</ThemedText>
                             <ThemedText style={styles.valueText}>${(balances.rdmz * 0.10).toFixed(2)}</ThemedText>
                        </View>
                    </View>
                    
                    <View style={[styles.assetItem, { borderBottomColor: colors.secondary }]}>
                        <View style={styles.assetInfo}>
                            <View style={[styles.assetIcon, { backgroundColor: '#26A17B' }]}>
                                <ThemedText style={styles.assetIconText}>T</ThemedText>
                            </View>
                            <View>
                                <ThemedText style={styles.assetName}>Tether</ThemedText>
                                <View style={styles.symbolRow}>
                                    <ThemedText style={styles.assetSymbol}>USDT</ThemedText>
                                    <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 2 }} />
                                    <ThemedText style={styles.networkLabel}>Solana</ThemedText>
                                </View>
                            </View>
                        </View>
                         <View style={styles.assetBalance}>
                             <ThemedText style={styles.balanceText}>{balances.usdt.toFixed(2)}</ThemedText>
                             <ThemedText style={styles.valueText}>${(balances.usdt * 1.00).toFixed(2)}</ThemedText>
                        </View>
                    </View>
                </View>
                
                <Button 
                    title="Export Private Key" 
                    variant="outline" 
                    onPress={() => router.push('/(tabs)/profile/wallet/export-key' as any)}
                    style={{ marginTop: 40, borderColor: '#ff4444' }}
                />
            </ScrollView>
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
        paddingBottom: Platform.OS === 'ios' ? 120 : 40,
    },
    balanceCard: {
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 30,
        position: 'relative',
    },
    networkBadge: {
        position: 'absolute',
        top: 14,
        right: 14,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 255, 163, 0.08)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 163, 0.15)',
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#00FFA3',
        shadowColor: '#00FFA3',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
    },
    networkText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#00FFA3',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    label: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 8,
        marginTop: 8,
    },
    totalAmount: {
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 16,
        paddingTop: 8,
        paddingBottom: 12,
        lineHeight: 45, // Force enough height for bottom glyphs
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    address: {
        fontSize: 12,
        opacity: 0.8,
        fontFamily: 'monospace',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 30,
    },
    actionButton: {
        alignItems: 'center',
        gap: 8,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    sectionTitle: {
        marginBottom: 15,
    },
    assetList: {
        gap: 0,
    },
    assetItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    assetInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    assetIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    assetIconText: {
        fontWeight: 'bold',
        color: '#fff',
    },
    assetName: {
        fontWeight: '600',
        fontSize: 16,
    },
    symbolRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    assetSymbol: {
        fontSize: 12,
        opacity: 0.6,
    },
    networkLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        fontWeight: '500',
    },
    assetBalance: {
        alignItems: 'flex-end',
    },
    balanceText: {
        fontWeight: '600',
        fontSize: 16,
    },
    valueText: {
        fontSize: 12,
        opacity: 0.6,
    }
});
