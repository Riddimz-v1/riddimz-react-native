// This file is a fallback for using MaterialIcons on Android and San Francisco Symbols on iOS.
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolView, SymbolViewProps, SFSymbol } from 'expo-symbols';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string;
  style?: StyleProp<TextStyle>;
  weight?: SymbolViewProps['weight'];
}) {
    // strict implementation not needed for this MVP, just a placeholder if needed
    // But since I used Ionicons directly in _layout.tsx, this might not be strictly used there 
    // but good to have for standard expo template compatibility if I used it.
    // However, I used Ionicons in the _layout.tsx I wrote. 
    // So this file might be redundant based on my _layout.tsx, but I'll keep it simple.
  return <MaterialIcons color={color} size={size} name={name as any} style={style} />;
}
