import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '../atoms/ThemedText';

export class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText>Something went wrong.</ThemedText>
        </View>
      );
    }
    return this.props.children;
  }
}
