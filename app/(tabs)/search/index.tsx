import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/atoms/ThemedText';
import { ThemedView } from '@/components/atoms/ThemedView';

import { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { contentService } from '@/services/api/content';
import { SearchResponse, TrackResponse, SeriesResp } from '@/services/api/types';
import { useTheme } from '@/hooks/useTheme';

export default function SearchScreen() {
    const { colors } = useTheme();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.trim()) {
                handleSearch();
            } else {
                setResults(null);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = await contentService.search(query);
            setResults(data);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.searchBar}>
          <TextInput 
            style={[styles.input, { color: colors.text, backgroundColor: colors.secondary }]}
            placeholder="Songs, artists, or podcasts"
            placeholderTextColor="#666"
            value={query}
            onChangeText={setQuery}
          />
      </View>

      <FlatList
        data={results ? [...results.tracks, ...results.podcasts] : []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem}>
                <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                <ThemedText style={styles.type}>
                    {'artist' in item ? 'Song • ' + item.artist.username : 'Podcast'}
                </ThemedText>
            </TouchableOpacity>
        )}
        ListEmptyComponent={query && !loading ? <ThemedText style={styles.empty}>No results found</ThemedText> : null}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  searchBar: {
      padding: 20,
  },
  input: {
      height: 45,
      borderRadius: 8,
      paddingHorizontal: 15,
      fontSize: 16,
  },
  resultItem: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#1a1a1a',
  },
  type: {
      fontSize: 12,
      opacity: 0.6,
      marginTop: 4,
  },
  empty: {
      textAlign: 'center',
      marginTop: 40,
      opacity: 0.5,
  }
});
