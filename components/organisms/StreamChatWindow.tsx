import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ThemedText } from '../atoms/ThemedText';

export function StreamChatWindow() {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Live Chat</ThemedText>
      <FlatList
        data={[{ id: '1', user: 'Fan1', msg: 'Love this!' }]}
        renderItem={({ item }) => (
          <ThemedText style={{ fontSize: 12 }}>
            <ThemedText type="defaultSemiBold">{item.user}: </ThemedText>
            {item.msg}
          </ThemedText>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 150,
    width: '100%',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
      fontSize: 14,
      opacity: 0.7,
      marginBottom: 5,
  }
});
