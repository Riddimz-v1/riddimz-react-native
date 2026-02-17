import { restClient } from './restClient';
import { RoomResponse, RoomCreate, SoundtrackUploadResponse, LyricsSyncResponse, KaraokeSearchResponse, GiftParticipantRequest } from './types';

export const karaokeService = {
  getRooms: async (skip: number = 0, limit: number = 20): Promise<RoomResponse[]> => {
    return restClient.get<RoomResponse[]>(`/karaoke/rooms?skip=${skip}&limit=${limit}`, { auth: false });
  },

  createRoom: async (data: RoomCreate): Promise<RoomResponse> => {
    return restClient.post<RoomResponse>('/karaoke/rooms', data);
  },

  addToQueue: async (roomId: string, trackId: string): Promise<RoomResponse> => {
    return restClient.post<RoomResponse>(`/karaoke/rooms/${roomId}/queue?track_id=${trackId}`);
  },

  nextSong: async (roomId: string): Promise<RoomResponse> => {
    return restClient.post<RoomResponse>(`/karaoke/rooms/${roomId}/next`);
  },
  
  uploadSoundtrack: async (roomId: string, audioFile: any, lyricsFile: any): Promise<SoundtrackUploadResponse> => {
      const formData = new FormData();
      formData.append('audio', audioFile);
      if (lyricsFile) formData.append('lyrics', lyricsFile);
      
      return restClient.post<SoundtrackUploadResponse>(`/karaoke/rooms/${roomId}/upload-soundtrack`, formData);
  },

  requestJoin: async (roomId: string): Promise<{ message: string }> => {
    return restClient.post<{ message: string }>(`/karaoke/rooms/${roomId}/request-join`);
  },

  approveUser: async (roomId: string, userId: string | number): Promise<{ status: string }> => {
    return restClient.post<{ status: string }>(`/karaoke/rooms/${roomId}/approve/${userId}`);
  },

  rejectUser: async (roomId: string, userId: string | number): Promise<{ status: string }> => {
    return restClient.post<{ status: string }>(`/karaoke/rooms/${roomId}/reject/${userId}`);
  },

  syncLyrics: async (roomId: string, audioFile: any): Promise<LyricsSyncResponse> => {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('room_id', roomId);
    return restClient.post<LyricsSyncResponse>('/karaoke/sync', formData);
  },

  syncDownload: async (roomId: string, url: string): Promise<LyricsSyncResponse> => {
    const formData = new FormData();
    formData.append('url', url);
    formData.append('room_id', roomId);
    return restClient.post<LyricsSyncResponse>('/karaoke/sync-download', formData);
  },

  searchGlobally: async (query: string): Promise<KaraokeSearchResponse> => {
    return restClient.get<KaraokeSearchResponse>(`/karaoke/search?query=${encodeURIComponent(query)}`);
  },

  giftParticipant: async (roomId: string, data: GiftParticipantRequest): Promise<{ message: string }> => {
    return restClient.post<{ message: string }>(`/karaoke/rooms/${roomId}/gift`, data);
  },

  endSession: async (roomId: string): Promise<{ message: string }> => {
    return restClient.post<{ message: string }>(`/karaoke/rooms/${roomId}/end`);
  }
};
