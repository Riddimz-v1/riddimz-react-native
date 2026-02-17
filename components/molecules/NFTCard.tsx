import { View, StyleSheet, Image } from 'react-native';
import { ThemedText } from '../atoms/ThemedText';
import { useTheme } from '@/hooks/useTheme';

export function NFTCard({ name, price, imageUrl }: { name: string, price: string, imageUrl?: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.secondary }]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder} />
      )}
      <View style={styles.content}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>{name}</ThemedText>
        <ThemedText style={{ opacity: 0.7 }}>{price}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    width: '100%',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#1a1a1a',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  content: {
    padding: 12,
  }
});
