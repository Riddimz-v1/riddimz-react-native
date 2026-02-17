import { restClient } from './restClient';
import { UserCreate, Token, WalletConnect, UserResponse, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest, ManagedWalletResponse, LoginRequest } from './types';
import { storage } from '@/utils/storage';

export const authService = {
  register: async (data: UserCreate): Promise<Token> => {
    const token = await restClient.post<Token>('/auth/register', data, { auth: false });
    await storage.setItem('auth_token', token.access_token);
    return token;
  },

  login: async (data: LoginRequest): Promise<Token> => {
    const token = await restClient.post<Token>('/auth/login', data, { auth: false });
    await storage.setItem('auth_token', token.access_token);
    return token;
  },

  googleLogin: async (idToken: string): Promise<Token> => {
    const token = await restClient.post<Token>('/auth/google', { id_token: idToken }, { auth: false });
    await storage.setItem('auth_token', token.access_token);
    return token;
  },

  walletConnect: async (data: WalletConnect): Promise<Token> => {
    const token = await restClient.post<Token>('/auth/wallet-connect', data, { auth: false });
    await storage.setItem('auth_token', token.access_token);
    return token;
  },

  registerWallet: async (data: WalletConnect): Promise<{ token: Token; user: UserResponse }> => {
    const response = await restClient.post<{ token: Token; user: UserResponse }>('/auth/register-wallet', data, { auth: false });
    await storage.setItem('auth_token', response.token.access_token);
    return response;
  },

  refresh: async (): Promise<Token> => {
    return restClient.post<Token>('/auth/refresh');
  },

  logout: async () => {
    await storage.removeItem('auth_token');
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ status: string; message: string }> => {
    return restClient.post<{ status: string; message: string }>('/auth/change-password', data);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ status: string; message: string }> => {
    return restClient.post<{ status: string; message: string }>('/auth/forgot-password', data, { auth: false });
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<{ status: string; message: string }> => {
    return restClient.post<{ status: string; message: string }>('/auth/reset-password', data, { auth: false });
  },

  exportKey: async (password: string): Promise<ManagedWalletResponse> => {
    return restClient.get<ManagedWalletResponse>(`/auth/export-key?password=${encodeURIComponent(password)}`);
  }
};
