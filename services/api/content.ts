import { restClient } from './restClient';
import { TrackResponse, TrackCreate, SeriesResp, SeriesCreate, EpisodeResp, EpisodeCreate, SearchResponse } from './types';

export const contentService = {
  getTracks: async (skip: number = 0, limit: number = 20): Promise<TrackResponse[]> => {
    return restClient.get<TrackResponse[]>(`/content/tracks?skip=${skip}&limit=${limit}`, { auth: false });
  },

  uploadTrack: async (track: TrackCreate): Promise<TrackResponse> => {
    return restClient.post<TrackResponse>('/content/tracks', track);
  },

  getPodcasts: async (skip: number = 0, limit: number = 20): Promise<SeriesResp[]> => {
    return restClient.get<SeriesResp[]>(`/content/podcasts?skip=${skip}&limit=${limit}`, { auth: false });
  },

  createPodcast: async (podcast: SeriesCreate): Promise<SeriesResp> => {
    return restClient.post<SeriesResp>('/content/podcasts', podcast);
  },

  getEpisodes: async (seriesId: string): Promise<EpisodeResp[]> => {
    return restClient.get<EpisodeResp[]>(`/content/podcasts/${seriesId}/episodes`, { auth: false });
  },

  addEpisode: async (episode: EpisodeCreate): Promise<EpisodeResp> => {
    return restClient.post<EpisodeResp>('/content/episodes', episode);
  },

  search: async (query: string): Promise<SearchResponse> => {
    return restClient.get<SearchResponse>(`/content/search?q=${encodeURIComponent(query)}`, { auth: false });
  }
};
