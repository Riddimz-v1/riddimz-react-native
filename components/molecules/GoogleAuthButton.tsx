import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Button } from '../atoms/Button'; // Assuming Button is in atoms
import { Alert } from 'react-native';
import { authService } from '@/services/api/auth';
import { useRouter } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export function GoogleAuthButton() {
  const router = useRouter();
  const [request, response, promptAsync] = Google.useAuthRequest({
    // clientId: 'YOUR_WEB_CLIENT_ID',
    // iosClientId: 'YOUR_IOS_CLIENT_ID',
    // androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    // For now we will use a placeholder or partial implementation as we don't have real IDs
    clientId: 'PLACEHOLDER_CLIENT_ID', 
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      
      const loginWithGoogle = async () => {
          try {
            await authService.googleLogin(id_token);
            router.replace('/(tabs)/home');
          } catch (error: any) {
             Alert.alert('Google Login Failed', error.message);
          }
      }
      
      loginWithGoogle();
    }
  }, [response]);

  return (
    <Button
      title="Continue with Google"
      variant="outline"
      disabled={!request}
      onPress={() => {
        promptAsync();
      }}
    />
  );
}
