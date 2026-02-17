import { View, StyleSheet, Switch, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { Button } from '@/components/atoms/Button';
import { ThemedTextInput } from '@/components/atoms/ThemedTextInput';
import { useState } from 'react';
import { Colors } from '@/utils/constants';
import { storage } from '@/utils/storage';

import { authService } from '@/services/api/auth';
import { GoogleAuthButton } from '@/components/molecules/GoogleAuthButton';

export default function SignupScreen() {
  const router = useRouter();
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    if (!consent) return;
    if (!username || !email || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
    }

    setLoading(true);
    
    try {
        await storage.setItem('gdpr_consent', 'true');
        
        await authService.register({
            username,
            email,
            password
        });
        
        router.replace('/(tabs)/home');
    } catch (err: any) {
        console.error(err);
        Alert.alert('Registration Failed', err.message || 'An error occurred during registration');
    } finally {
        setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
                <ThemedText style={styles.description}>
                    Join the Riddimz revolution. Please provide your details to get started.
                </ThemedText>
            </View>

            <View style={styles.form}>
                <ThemedTextInput 
                    label="Username"
                    placeholder="Enter your username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />
                
                <ThemedTextInput 
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <ThemedTextInput 
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <View style={styles.consentContainer}>
                    <View style={styles.switchRow}>
                        <Switch 
                            value={consent} 
                            onValueChange={setConsent} 
                            trackColor={{ false: '#767577', true: Colors.dark.primary }}
                        />
                        <ThemedText style={styles.consentText}>
                            I agree to the Terms of Service and Privacy Policy. I consent to store my data securely.
                        </ThemedText>
                    </View>
                </View>
            </View>
            
            <View style={styles.footer}>
                <Button 
                    title="Complete Setup" 
                    onPress={handleSignup} 
                    isLoading={loading}
                    disabled={!consent}
                />
                
                <View style={styles.googleContainer}>
                    <GoogleAuthButton />
                </View>
                
                <View style={styles.loginPrompt}>
                    <ThemedText style={styles.loginText}>Already have an account? </ThemedText>
                    <TouchableOpacity onPress={() => router.push('/onboarding/login' as any)}>
                        <ThemedText style={styles.loginLink}>Log In</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 20,
  },
  googleContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  consentContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  consentText: {
    flex: 1,
    fontSize: 14,
  },
  footer: {
    paddingBottom: 50,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    opacity: 0.7,
  },
  loginLink: {
    fontSize: 14,
    color: Colors.dark.primary,
    fontWeight: 'bold',
  }
});
