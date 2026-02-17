import { restClient } from './restClient';
import { StreamConfig, FeedItem } from './types';

export const streamingService = {
  goLive: async (): Promise<StreamConfig> => {
    return restClient.post<StreamConfig>('/streaming/go-live');
  },

  getFeeds: async (skip: number = 0, limit: number = 20): Promise<FeedItem[]> => {
    return restClient.get<FeedItem[]>(`/streaming/feeds?skip=${skip}&limit=${limit}`, { auth: false });
  }
};
