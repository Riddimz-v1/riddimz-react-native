import { Text, type TextProps, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { colors } = useTheme();
  const color = colors.text;

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'SpotifyMixUI-Regular',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'SpotifyMixUI-Bold',
  },
  title: {
    fontSize: 32,
    fontFamily: 'SpotifyMixUI-TitleBold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'SpotifyMixUI-Bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#4d60c0',
    fontFamily: 'SpotifyMixUI-Regular',
  },
});
