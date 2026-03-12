import {
    StyleSheet, View, ScrollView, Switch, TouchableOpacity,
    Alert, Platform, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { ThemedTextInput } from '@/components/atoms/ThemedTextInput';
import { Button } from '@/components/atoms/Button';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useUserStore } from '@/stores/user';
import { useState } from 'react';
import { authService } from '@/services/api/auth';
import { Colors } from '@/utils/constants';

export default function PrivacySecurityScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { settings, updateSettings } = useUserStore();

    // Change password
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all password fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            Alert.alert('Error', 'New password must be at least 8 characters.');
            return;
        }

        setChangingPassword(true);
        try {
            await authService.changePassword({
                old_password: currentPassword,
                new_password: newPassword,
            });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordSection(false);
            Alert.alert('Success', 'Your password has been updated.');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to change password. Check your current password and try again.');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to permanently delete your account & data? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive', 
                    onPress: async () => {
                        setDeleting(true);
                        // Simulate delay, then logout (since real API doesn't have delete yet)
                        setTimeout(async () => {
                            await authService.logout();
                            router.replace('/onboarding');
                        }, 1000);
                    } 
                },
            ]
        );
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="title">Privacy & Security</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Privacy */}
                <ThemedText style={styles.sectionTitle}>Privacy</ThemedText>
                <View style={[styles.card, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                    <View style={[styles.settingRow, { borderBottomColor: 'rgba(255,255,255,0.06)' }]}>
                        <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
                            <Ionicons name="globe-outline" size={18} color={colors.primary} />
                        </View>
                        <View style={styles.settingText}>
                            <ThemedText style={styles.settingLabel}>Public Profile</ThemedText>
                            <ThemedText style={styles.settingDescription}>
                                Allow others to discover and view your profile
                            </ThemedText>
                        </View>
                        <Switch
                            value={settings.publicProfile}
                            onValueChange={() => updateSettings({ publicProfile: !settings.publicProfile })}
                            trackColor={{ false: '#444', true: Colors.dark.primary }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={[styles.settingRow, { borderBottomColor: 'rgba(255,255,255,0.06)' }]}>
                        <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
                            <Ionicons name="wallet-outline" size={18} color={colors.primary} />
                        </View>
                        <View style={styles.settingText}>
                            <ThemedText style={styles.settingLabel}>Show Wallet Address</ThemedText>
                            <ThemedText style={styles.settingDescription}>
                                Display your wallet address on your public profile
                            </ThemedText>
                        </View>
                        <Switch
                            value={settings.showWalletAddress}
                            onValueChange={() => updateSettings({ showWalletAddress: !settings.showWalletAddress })}
                            trackColor={{ false: '#444', true: Colors.dark.primary }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                {/* Security */}
                <ThemedText style={[styles.sectionTitle, { marginTop: 24 }]}>Security</ThemedText>
                <View style={[styles.card, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                    {/* Change Password */}
                    <TouchableOpacity
                        style={[styles.settingRow, { borderBottomColor: 'rgba(255,255,255,0.06)' }]}
                        onPress={() => setShowPasswordSection((v) => !v)}
                    >
                        <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
                            <Ionicons name="key-outline" size={18} color={colors.primary} />
                        </View>
                        <View style={styles.settingText}>
                            <ThemedText style={styles.settingLabel}>Change Password</ThemedText>
                            <ThemedText style={styles.settingDescription}>
                                Update your account password
                            </ThemedText>
                        </View>
                        <Ionicons
                            name={showPasswordSection ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color="#555"
                        />
                    </TouchableOpacity>

                    {showPasswordSection && (
                        <View style={styles.passwordSection}>
                            <ThemedTextInput
                                label="Current Password"
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry
                            />
                            <ThemedTextInput
                                label="New Password"
                                placeholder="Enter new password (min 8 chars)"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                            />
                            <ThemedTextInput
                                label="Confirm New Password"
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                            <Button
                                title="Update Password"
                                onPress={handleChangePassword}
                                isLoading={changingPassword}
                            />
                        </View>
                    )}

                    <View style={styles.settingRow}>
                        <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
                            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
                        </View>
                        <View style={styles.settingText}>
                            <ThemedText style={styles.settingLabel}>Two-Factor Authentication</ThemedText>
                            <ThemedText style={styles.settingDescription}>
                                Extra layer of security (coming soon)
                            </ThemedText>
                        </View>
                        <Switch
                            value={false}
                            onValueChange={() => Alert.alert('Coming Soon', '2FA will be available in a future update.')}
                            trackColor={{ false: '#444', true: Colors.dark.primary }}
                            thumbColor="#fff"
                            disabled
                        />
                    </View>
                </View>

                {/* Danger Zone */}
                <ThemedText style={[styles.sectionTitle, { marginTop: 24 }]}>Danger Zone</ThemedText>
                <View style={[styles.card, { backgroundColor: 'rgba(255,0,0,0.05)' }]}>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={handleDeleteAccount}
                        disabled={deleting}
                    >
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(255,60,60,0.15)' }]}>
                            {deleting ? (
                                <ActivityIndicator size="small" color="#ff4444" />
                            ) : (
                                <Ionicons name="trash-outline" size={18} color="#ff4444" />
                            )}
                        </View>
                        <View style={styles.settingText}>
                            <ThemedText style={[styles.settingLabel, { color: '#ff4444' }]}>
                                {deleting ? 'Deleting...' : 'Delete Account'}
                            </ThemedText>
                            <ThemedText style={styles.settingDescription}>
                                Permanently remove your account and data
                            </ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#555" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: { padding: 8 },
    content: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 80 : 40,
    },
    sectionTitle: {
        fontSize: 13,
        opacity: 0.5,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10,
        marginLeft: 4,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        gap: 12,
    },
    iconBox: {
        width: 34,
        height: 34,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingText: { flex: 1 },
    settingLabel: { fontSize: 15, fontWeight: '500' },
    settingDescription: { fontSize: 12, opacity: 0.5, marginTop: 2 },
    passwordSection: {
        padding: 16,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
});
