import { restClient } from './restClient';
import { NFTResponse, NFTCreate, NFTPurchase, PurchaseStatus, StatusMessage } from './types';

export const marketplaceService = {
  getListings: async (skip: number = 0, limit: number = 20): Promise<NFTResponse[]> => {
    return restClient.get<NFTResponse[]>(`/marketplace/listings?skip=${skip}&limit=${limit}`, { auth: false });
  },

  mintNFT: async (data: NFTCreate): Promise<NFTResponse> => {
    return restClient.post<NFTResponse>('/marketplace/mint', data);
  },

  buyNFT: async (data: NFTPurchase): Promise<PurchaseStatus> => {
    return restClient.post<PurchaseStatus>('/marketplace/buy', data);
  },

  listNFT: async (id: string, price: number): Promise<StatusMessage> => {
    return restClient.patch<StatusMessage>(`/marketplace/list/${id}?price=${price}`);
  },

  unlistNFT: async (id: string): Promise<StatusMessage> => {
    return restClient.patch<StatusMessage>(`/marketplace/unlist/${id}`);
  }
};
