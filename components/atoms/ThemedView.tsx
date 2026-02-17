import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...rest }: ThemedViewProps) {
  const { colors } = useTheme();
  const backgroundColor = colors.background;

  return <View style={[{ backgroundColor }, style]} {...rest} />;
}
