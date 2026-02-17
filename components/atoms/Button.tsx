import React from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BRAND_GRADIENT } from '@/utils/constants';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: StyleProp<ViewStyle>;
}

export function Button({ title, onPress, isLoading, disabled, variant = 'primary', style }: ButtonProps) {
    const { colors } = useTheme();

    const getBackgroundColor = () => {
        if (disabled) return '#1a1a1a';
        switch (variant) {
            case 'primary': return 'transparent'; 
            case 'secondary': return colors.secondary;
            case 'outline': return 'transparent';
            default: return 'transparent';
        }
    };

    const getTextColor = () => {
        if (disabled) return '#444';
         switch (variant) {
            case 'primary': return '#fff'; 
            case 'secondary': return '#fff';
            case 'outline': return colors.primary;
            default: return '#fff';
        }
    };

    const content = (
        <View style={styles.internalPadding}>
            {isLoading ? (
                <ActivityIndicator color={getTextColor()} size="small" />
            ) : (
                <ThemedText style={[styles.text, { color: getTextColor() }, variant === 'primary' && styles.textShadow]}>
                    {title}
                </ThemedText>
            )}
        </View>
    );

    return (
        <TouchableOpacity 
            style={[
                styles.container, 
                variant === 'outline' && [styles.outline, { borderColor: colors.primary }],
                disabled && styles.disabledContainer,
                style
            ]} 
            onPress={onPress}
            disabled={disabled || isLoading}
            activeOpacity={0.7}
        >
            <View style={[styles.clippingContainer, { backgroundColor: getBackgroundColor() }]}>
                {variant === 'primary' && !disabled ? (
                    <LinearGradient
                        colors={BRAND_GRADIENT as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                    >
                        {content}
                    </LinearGradient>
                ) : (
                    content
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        minWidth: 180,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
            web: {
                // @ts-ignore
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
            }
        })
    },
    clippingContainer: {
        borderRadius: 30,
        overflow: 'hidden',
        alignItems: 'stretch',
        justifyContent: 'center',
    },
    disabledContainer: {
        elevation: 0,
        shadowOpacity: 0,
    },
    internalPadding: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56,
    },
    gradient: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    outline: {
        borderRadius: 30,
        borderWidth: 2,
    },
    text: {
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: 'SpotifyMixUI-Bold',
        letterSpacing: 0.5,
    },
    textShadow: {
        ...Platform.select({
            web: {
                // @ts-ignore
                textShadow: '0px 1px 3px rgba(0, 0, 0, 0.3)',
            },
            default: {
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
            }
        })
    }
});
