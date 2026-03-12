import {
    StyleSheet, View, ScrollView, Switch, TouchableOpacity, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useUserStore } from '@/stores/user';
import { Colors } from '@/utils/constants';

interface SettingRowProps {
    icon: any;
    label: string;
    description?: string;
    value: boolean;
    onToggle: () => void;
    colors: any;
}

function SettingRow({ icon, label, description, value, onToggle, colors }: SettingRowProps) {
    return (
        <View style={[styles.settingRow, { borderBottomColor: 'rgba(255,255,255,0.06)' }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
                <Ionicons name={icon} size={18} color={colors.primary} />
            </View>
            <View style={styles.settingText}>
                <ThemedText style={styles.settingLabel}>{label}</ThemedText>
                {description && (
                    <ThemedText style={styles.settingDescription}>{description}</ThemedText>
                )}
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: '#444', true: Colors.dark.primary }}
                thumbColor="#fff"
            />
        </View>
    );
}

export default function NotificationsScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { settings, toggleNotification, updateSettings } = useUserStore();

    const handlePushToggle = () => {
        toggleNotification(); 
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="title">Notifications</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <ThemedText style={styles.sectionTitle}>Push Notifications</ThemedText>
                <View style={[styles.card, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                    <SettingRow
                        icon="notifications"
                        label="Push Notifications"
                        description="Master toggle for all push alerts"
                        value={settings.notifications}
                        onToggle={handlePushToggle}
                        colors={colors}
                    />
                    <SettingRow
                        icon="mic"
                        label="Karaoke Room Alerts"
                        description="When someone joins your room"
                        value={settings.karaokeAlerts && settings.notifications}
                        onToggle={() => updateSettings({ karaokeAlerts: !settings.karaokeAlerts })}
                        colors={colors}
                    />
                    <SettingRow
                        icon="gift"
                        label="Gifts & Tips"
                        description="When you receive RDMZ tokens"
                        value={settings.giftsAlerts && settings.notifications}
                        onToggle={() => updateSettings({ giftsAlerts: !settings.giftsAlerts })}
                        colors={colors}
                    />
                    <SettingRow
                        icon="person-add"
                        label="New Followers"
                        description="When someone follows your profile"
                        value={settings.newFollowers && settings.notifications}
                        onToggle={() => updateSettings({ newFollowers: !settings.newFollowers })}
                        colors={colors}
                    />
                    <SettingRow
                        icon="storefront"
                        label="Marketplace Activity"
                        description="NFT sales and price changes"
                        value={settings.marketplaceAlerts && settings.notifications}
                        onToggle={() => updateSettings({ marketplaceAlerts: !settings.marketplaceAlerts })}
                        colors={colors}
                    />
                </View>

                <ThemedText style={[styles.sectionTitle, { marginTop: 24 }]}>Email</ThemedText>
                <View style={[styles.card, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                    <SettingRow
                        icon="mail"
                        label="Weekly Digest"
                        description="Summary of your weekly activity"
                        value={settings.emailDigest}
                        onToggle={() => updateSettings({ emailDigest: !settings.emailDigest })}
                        colors={colors}
                    />
                </View>

                <ThemedText style={styles.disclaimer}>
                    Notification preferences are securely saved locally.
                </ThemedText>
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
    disclaimer: {
        fontSize: 11,
        opacity: 0.35,
        textAlign: 'center',
        marginTop: 24,
        paddingHorizontal: 10,
        lineHeight: 16,
    },
});
