import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';
import { Button } from '@/components/atoms/Button';
import { ThemedTextInput } from '@/components/atoms/ThemedTextInput';
import { useState } from 'react';
import { Colors } from '@/utils/constants';
import { authService } from '@/services/api/auth';
import { GoogleAuthButton } from '@/components/molecules/GoogleAuthButton';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
        Alert.alert('Error', 'Please enter both your email and password');
        return;
    }

    setLoading(true);
    try {
        await authService.login({ email, password });
        router.replace('/(tabs)/home');
    } catch (err: any) {
        console.error(err);
        Alert.alert('Login Failed', err.message || 'Invalid credentials');
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
                <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>
                <ThemedText style={styles.description}>
                    Log in to your account and keep the rhythm going.
                </ThemedText>
            </View>

            <View style={styles.form}>
                <ThemedTextInput 
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <ThemedTextInput 
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.forgotPassword}>
                    <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
                </TouchableOpacity>
            </View>
            
            <View style={styles.footer}>
                <Button 
                    title="Log In" 
                    onPress={handleLogin} 
                    isLoading={loading}
                />
                <GoogleAuthButton />
                
                <View style={styles.signupPrompt}>
                    <ThemedText style={styles.signupText}>Don't have an account? </ThemedText>
                    <TouchableOpacity onPress={() => router.push('/onboarding/signup')}>
                        <ThemedText style={styles.signupLink}>Sign Up</ThemedText>
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
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
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
    marginBottom: 30,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -10,
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  footer: {
    paddingBottom: 50,
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
    opacity: 0.7,
  },
  signupLink: {
    fontSize: 14,
    color: Colors.dark.primary,
    fontWeight: 'bold',
  }
});
