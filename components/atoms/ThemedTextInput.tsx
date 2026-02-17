import React, { useState } from 'react';
import { TextInput, StyleSheet, View, TextInputProps, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';

interface ThemedTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function ThemedTextInput({ label, error, style, secureTextEntry, ...props }: ThemedTextInputProps) {
  const { colors } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const isPassword = secureTextEntry;

  return (
    <View style={styles.container}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            { 
              color: colors.text, 
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderColor: error ? '#ff4444' : 'rgba(255,255,255,0.1)',
              paddingRight: isPassword ? 48 : 16,
            },
            style,
          ]}
          placeholderTextColor="#666"
          secureTextEntry={isPassword && !isPasswordVisible}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
              size={22} 
              color="#999" 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  inputWrapper: {
    width: '100%',
    justifyContent: 'center',
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
});
