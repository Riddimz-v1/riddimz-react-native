import { useWalletStore } from '../stores/wallet';

export function useWallet() {
    return useWalletStore();
}
