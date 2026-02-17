import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/utils/storage';

export interface WalletState {
  address: string | null;
  balances: {
    sol: number;
    rdmz: number;
    usdt: number;
  };
  isConnected: boolean;
  connect: (userAddress?: string) => Promise<void>; // Kept for signature compatibility but logic changes
  refreshBalances: () => Promise<void>;
  disconnect: () => void;
  gift: (amount: number, recipientAddress: string) => Promise<boolean>;
  send: (amount: number, recipientAddress: string, token: 'rdmz' | 'sol' | 'usdt') => Promise<boolean>;
}

import { tokenService } from '../services/api/token';
import { getBalance, getSPLBalance } from '../services/web3/solanaClient';
import { WEB3_CONFIG } from '@/utils/constants';

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      address: null,
      balances: { sol: 0, rdmz: 0, usdt: 0 },
      isConnected: false,
      connect: async (userAddress?: string) => {
        // For managed wallets, we primarily get address/balance from backend
        // userAddress arg is optional override or legacy
        try {
            const tokenBalance = await tokenService.getBalance();
            const address = tokenBalance.wallet_address || userAddress;
            console.log(`[WalletStore] connect - backend address: ${tokenBalance.wallet_address}, override: ${userAddress}`);
            
            if (address && address !== '...') {
                // Fetch other balances from chain
                const sol = await getBalance(address);
                const usdt = await getSPLBalance(address, WEB3_CONFIG.usdtMintAddress);
                
                set({ 
                    address, 
                    isConnected: true,
                    balances: {
                        rdmz: tokenBalance.balance,
                        sol,
                        usdt
                    }
                });
            } else {
                console.warn('[WalletStore] connect - no valid address found');
            }
        } catch (error) {
            console.error('Failed to fetch wallet details:', error);
        }
      },
      refreshBalances: async () => {
          const { address } = get();
          console.log(`[WalletStore] refreshBalances - current address: ${address}`);
          if (!address || address === '...') return;
          try {
             const tokenBalance = await tokenService.getBalance();
             const sol = await getBalance(address);
             const usdt = await getSPLBalance(address, WEB3_CONFIG.usdtMintAddress);
             
             set({
                 balances: {
                     rdmz: tokenBalance.balance,
                     sol,
                     usdt
                 }
             });
          } catch (error) {
              console.error('Failed to refresh balances:', error);
          }
      },
      disconnect: () => set({ address: null, isConnected: false, balances: { sol: 0, rdmz: 0, usdt: 0 } }),
      gift: async (amount: number, recipientAddress: string) => {
        const { address, isConnected } = get();
        if (!isConnected || !address) {
            console.error('Wallet not connected');
            return false;
        }

        try {
            await tokenService.giftTokens({
                recipient_wallet: recipientAddress,
                amount,
                signature: 'managed',
                message: 'Gift from Karaoke'
            });

            await get().refreshBalances();
            return true;
        } catch (error) {
            console.error('Gift failed:', error);
            return false;
        }
      },
      send: async (amount: number, recipientAddress: string, token: 'rdmz' | 'sol' | 'usdt') => {
          const { address, isConnected } = get();
          if (!isConnected || !address) return false;

          try {
              if (token === 'rdmz') {
                  await tokenService.transferTokens({
                      to_wallet: recipientAddress,
                      amount,
                      memo: 'Transfer from App'
                  });
              } else {
                  // Fallback or placeholder for SOL/USDT if backend doesn't support yet
                  // For now, let's assume backend might handle it or we show alert in UI
                  console.warn('SOL/USDT transfer not yet fully supported via this endpoint');
                  return false;
              }
              
              await get().refreshBalances();
              return true;
          } catch (error) {
              console.error('Send failed:', error);
              return false;
          }
      }
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => ({
        getItem: storage.getItem,
        setItem: storage.setItem,
        removeItem: storage.removeItem,
      })),
    }
  )
);
