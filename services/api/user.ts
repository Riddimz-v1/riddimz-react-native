import { restClient } from './restClient';
import { UserResponse, UserUpdate, UserEarnings, UserPublicResponse } from './types';

export const userService = {
  getProfile: async (): Promise<UserResponse> => {
    return restClient.get<UserResponse>('/user/profile');
  },

  updateProfile: async (data: any): Promise<UserResponse> => {
    return restClient.patch<UserResponse>('/user/update', data);
  },

  getPublicProfile: async (username: string): Promise<UserPublicResponse> => {
    return restClient.get<UserPublicResponse>(`/user/${username}`);
  },

  searchUsers: async (query: string, limit: number = 10): Promise<UserPublicResponse[]> => {
    return restClient.get<UserPublicResponse[]>(`/user/search/users?query=${encodeURIComponent(query)}&limit=${limit}`);
  },

  getEarnings: async (): Promise<UserEarnings> => {
    return restClient.get<UserEarnings>('/user/earnings');
  }
};
