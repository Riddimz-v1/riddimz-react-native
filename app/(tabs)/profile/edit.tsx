import {
    StyleSheet, View, ScrollView, TouchableOpacity,
    Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Image
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
import * as ImagePicker from 'expo-image-picker';

export default function ProfileEditScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { profile, fetchProfile } = useUserStore();
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(!profile);

    const [username, setUsername] = useState(profile?.username || '');
    const [displayName, setDisplayName] = useState(profile?.display_name || '');
    const [bio, setBio] = useState(profile?.bio || '');
    const [email, setEmail] = useState(profile?.email || '');
    const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatar_url || null);

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
            setEmail(profile.email || '');
            setAvatarUri(profile.avatar_url || null);
        }
    }, [profile]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!username.trim()) {
            Alert.alert('Error', 'Username cannot be empty');
            return;
        }

        setLoading(true);
        try {
            const updateData: any = {
                username: username.trim(),
                display_name: displayName.trim() || undefined,
                bio: bio.trim() || undefined,
                email: email.trim() || undefined,
            };

            // If a new avatar was picked, we might need to handle it as FormData
            // Check if URI is local or remote
            if (avatarUri && !avatarUri.startsWith('http')) {
                const formData = new FormData();
                formData.append('username', updateData.username);
                if (updateData.display_name) formData.append('display_name', updateData.display_name);
                if (updateData.bio) formData.append('bio', updateData.bio);
                if (updateData.email) formData.append('email', updateData.email);
                
                // @ts-ignore
                formData.append('avatar', {
                    uri: Platform.OS === 'ios' ? avatarUri.replace('file://', '') : avatarUri,
                    name: 'avatar.jpg',
                    type: 'image/jpeg',
                });
                
                await userService.updateProfile(formData as any);
            } else {
                await userService.updateProfile(updateData);
            }

            await fetchProfile();
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
                        <TouchableOpacity onPress={pickImage} style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                            {avatarUri ? (
                                <Image 
                                    source={{ uri: avatarUri }} 
                                    style={styles.avatarImage} 
                                />
                            ) : (
                                <ThemedText style={styles.avatarText}>
                                    {username?.charAt(0).toUpperCase() || 'R'}
                                </ThemedText>
                            )}
                            <View style={styles.editBadge}>
                                <Ionicons name="camera" size={16} color="#fff" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.changeAvatarBtn} onPress={pickImage}>
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

                        <ThemedTextInput
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
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
    avatarImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.dark.primary,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
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
