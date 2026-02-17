import { StyleSheet, View, ScrollView, RefreshControl, Platform, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { Button } from '@/components/atoms/Button';
import { Logo } from '@/components/atoms/Logo';
import { storage } from '@/utils/storage';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { authService } from '@/services/api/auth';
import { userService } from '@/services/api/user';
import { UserResponse, UserEarnings } from '@/services/api/types';
import { Colors, BRAND_GRADIENT } from '@/utils/constants';
import { useWallet } from '@/hooks/useWallet';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const router = useRouter();
    const { address, isConnected, disconnect, connect } = useWallet();
    const [user, setUser] = useState<UserResponse | null>(null);
    const [earnings, setEarnings] = useState<UserEarnings | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [profile, userEarnings] = await Promise.all([
                userService.getProfile(),
                userService.getEarnings()
            ]);
            setUser(profile);
            setEarnings(userEarnings);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    const handleLogout = async () => {
        await authService.logout();
        router.replace('/onboarding');
    };



    return (
        <ThemedView style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.primary} />}
            >
                <View style={styles.header}>
                    <LinearGradient
                        colors={BRAND_GRADIENT as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.avatarGradient}
                    >
                        <View style={styles.avatarInner}>
                            <ThemedText style={styles.avatarText}>
                                {user?.username?.charAt(0).toUpperCase() || 'R'}
                            </ThemedText>
                        </View>
                    </LinearGradient>
                    
                    <ThemedText type="title" style={styles.username}>{user?.username || 'Riddimz User'}</ThemedText>
                    <ThemedText style={styles.email}>{user?.email}</ThemedText>
                    
                    {user?.bio && <ThemedText style={styles.bio}>{user.bio}</ThemedText>}
                </View>

                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Digital Assets</ThemedText>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/profile/wallet' as any)}>
                        <View style={styles.card}>
                            <View style={styles.walletHeader}>
                                <View style={styles.walletInfo}>
                                    <Ionicons name="wallet-outline" size={24} color={Colors.dark.primary} />
                                    <View>
                                        <ThemedText type="defaultSemiBold">My Wallet</ThemedText>
                                        <ThemedText style={styles.walletAddress}>
                                            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Loading...'}
                                        </ThemedText>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#444" />
                            </View>

                            {earnings && (
                                <View style={styles.earningsBreakdown}>
                                    <View style={styles.earningItem}>
                                        <ThemedText style={styles.earningLabel}>Total Earned</ThemedText>
                                        <ThemedText style={styles.earningValue}>{earnings.total_earned} {earnings.currency}</ThemedText>
                                    </View>
                                    <View style={styles.divider} />
                                    <View style={styles.earningItem}>
                                        <ThemedText style={styles.earningLabel}>Pending</ThemedText>
                                        <ThemedText style={styles.earningValue}>0.00 {earnings.currency}</ThemedText>
                                    </View>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Account Settings</ThemedText>
                    <View style={styles.card}>
                        <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/(tabs)/profile')}>
                            <Ionicons name="person-outline" size={20} color="#fff" />
                            <ThemedText style={styles.settingText}>Edit Profile</ThemedText>
                            <Ionicons name="chevron-forward" size={18} color="#444" />
                        </TouchableOpacity>
                        <View style={styles.itemDivider} />
                        <TouchableOpacity style={styles.settingItem}>
                            <Ionicons name="notifications-outline" size={20} color="#fff" />
                            <ThemedText style={styles.settingText}>Notifications</ThemedText>
                            <Ionicons name="chevron-forward" size={18} color="#444" />
                        </TouchableOpacity>
                        <View style={styles.itemDivider} />
                        <TouchableOpacity style={styles.settingItem}>
                            <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
                            <ThemedText style={styles.settingText}>Privacy & Security</ThemedText>
                            <Ionicons name="chevron-forward" size={18} color="#444" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Button title="Log Out" variant="outline" onPress={handleLogout} />
                    <ThemedText style={styles.versionText}>Riddimz v1.0.0 (Alpha)</ThemedText>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        padding: 3,
        marginBottom: 15,
    },
    avatarInner: {
        flex: 1,
        borderRadius: 47,
        backgroundColor: Colors.dark.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
    },
    username: {
        marginBottom: 5,
    },
    email: {
        opacity: 0.5,
        fontSize: 14,
        marginBottom: 10,
    },
    bio: {
        textAlign: 'center',
        opacity: 0.7,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 12,
        marginLeft: 5,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
    },
    walletHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    walletInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    walletAddress: {
        fontSize: 12,
        opacity: 0.5,
    },
    walletButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    walletButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    earningsBreakdown: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    earningItem: {
        alignItems: 'center',
    },
    earningLabel: {
        fontSize: 12,
        opacity: 0.5,
        marginBottom: 5,
    },
    earningValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 15,
    },
    settingText: {
        flex: 1,
        fontSize: 15,
    },
    itemDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginLeft: 35,
    },
    footer: {
        marginTop: 20,
        paddingBottom: 40,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        opacity: 0.3,
        marginTop: 15,
    }
});
