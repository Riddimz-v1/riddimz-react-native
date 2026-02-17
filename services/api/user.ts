import { restClient } from './restClient';
import { UserResponse, UserUpdate, UserEarnings } from './types';

export const userService = {
  getProfile: async (): Promise<UserResponse> => {
    return restClient.get<UserResponse>('/user/profile');
  },

  updateProfile: async (data: UserUpdate): Promise<UserResponse> => {
    return restClient.patch<UserResponse>('/user/update', data);
  },

  getEarnings: async (): Promise<UserEarnings> => {
    return restClient.get<UserEarnings>('/user/earnings');
  }
};
