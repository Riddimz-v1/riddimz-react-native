import {
    StyleSheet, View, ScrollView, TouchableOpacity,
    Alert, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { ThemedTextInput } from '@/components/atoms/ThemedTextInput';
import { Button } from '@/components/atoms/Button';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useEffect, useState } from 'react';
import { userService } from '@/services/api/user';
import { useUserStore } from '@/stores/user';
import { UserUpdate } from '@/services/api/types';
import { Colors } from '@/utils/constants';

export default function ProfileEditScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { profile, fetchProfile } = useUserStore();
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(!profile);

    const [username, setUsername] = useState(profile?.username || '');
    const [displayName, setDisplayName] = useState(profile?.display_name || '');
    const [bio, setBio] = useState(profile?.bio || '');

    useEffect(() => {
        if (!profile) {
            setInitializing(true);
            fetchProfile().finally(() => setInitializing(false));
        }
    }, []);

    // Sync fields when profile loads
    useEffect(() => {
        if (profile) {
            setUsername(profile.username || '');
            setDisplayName(profile.display_name || '');
            setBio(profile.bio || '');
        }
    }, [profile]);

    const handleSave = async () => {
        if (!username.trim()) {
            Alert.alert('Error', 'Username cannot be empty');
            return;
        }

        setLoading(true);
        try {
            const updateData: UserUpdate = {
                username: username.trim(),
                display_name: displayName.trim() || undefined,
                bio: bio.trim() || undefined,
            };
            await userService.updateProfile(updateData);
            await fetchProfile(); // Sync the store with the new data
            Alert.alert('Saved', 'Your profile has been updated.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (initializing) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <ThemedText type="title">Edit Profile</ThemedText>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    {/* Avatar placeholder */}
                    <View style={styles.avatarSection}>
                        <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                            <ThemedText style={styles.avatarText}>
                                {username?.charAt(0).toUpperCase() || 'R'}
                            </ThemedText>
                        </View>
                        <TouchableOpacity style={styles.changeAvatarBtn}>
                            <ThemedText style={[styles.changeAvatarText, { color: colors.primary }]}>
                                Change Photo
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <ThemedTextInput
                            label="Username"
                            placeholder="Enter your username"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                        <ThemedTextInput
                            label="Display Name"
                            placeholder="Enter your display name"
                            value={displayName}
                            onChangeText={setDisplayName}
                        />
                        <ThemedTextInput
                            label="Bio"
                            placeholder="Tell the world about yourself..."
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={4}
                        />

                        <View style={[styles.readOnlyField, { backgroundColor: colors.secondary }]}>
                            <ThemedText style={styles.readOnlyLabel}>Email</ThemedText>
                            <ThemedText style={styles.readOnlyValue}>{profile?.email || '—'}</ThemedText>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <Button title="Save Changes" onPress={handleSave} isLoading={loading} />
                    <Button title="Cancel" variant="outline" onPress={() => router.back()} />
                </View>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
        paddingBottom: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
    },
    changeAvatarBtn: { padding: 8 },
    changeAvatarText: { fontSize: 14, fontWeight: '600' },
    form: { gap: 4 },
    readOnlyField: {
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    readOnlyLabel: {
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 4,
    },
    readOnlyValue: {
        fontSize: 15,
        opacity: 0.8,
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        gap: 12,
    },
});
