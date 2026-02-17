import { restClient } from './restClient';
import { TokenBalance, TokenGift, TokenTransfer, TransferResponse, BurnStats } from './types';

export const tokenService = {
  getBalance: async (): Promise<TokenBalance> => {
    return restClient.get<TokenBalance>('/token/balance');
  },

  giftTokens: async (data: TokenGift): Promise<TransferResponse> => {
    return restClient.post<TransferResponse>('/token/gift', data);
  },

  transferTokens: async (data: TokenTransfer): Promise<TransferResponse> => {
    return restClient.post<TransferResponse>('/token/transfer', data);
  },

  getBurnStats: async (): Promise<BurnStats> => {
    return restClient.get<BurnStats>('/token/burn-stats', { auth: false });
  }
};
