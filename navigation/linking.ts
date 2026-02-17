import * as Linking from 'expo-linking';

export const linking = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      '(tabs)': {
        screens: {
          'home/index': 'home',
          'search/index': 'search',
          'karaoke/index': 'karaoke',
          'library/index': 'library',
          'profile/index': 'profile',
        },
      },
      onboarding: 'onboarding',
      marketplace: 'marketplace',
      streaming: 'streaming',
      podcast: 'podcast',
    },
  },
};
