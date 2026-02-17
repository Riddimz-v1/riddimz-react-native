import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { WEB3_CONFIG } from '@/utils/constants';

// Use mainnet-beta or devnet
const network = clusterApiUrl('mainnet-beta');

export const connection = new Connection(network, 'confirmed');

export const getBalance = async (publicKey: string) => {
    if (!publicKey || publicKey === '...') {
        console.warn('[SolanaClient] getBalance called with invalid address:', publicKey);
        return 0;
    }
    try {
        const pubKey = new PublicKey(publicKey);
        const balance = await connection.getBalance(pubKey);
        return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
        console.error(`[SolanaClient] Error fetching SOL balance for ${publicKey}:`, error);
        return 0;
    }
};

export const getSPLBalance = async (walletAddress: string, tokenMintAddress: string) => {
    if (!walletAddress || walletAddress === '...') {
        console.warn('[SolanaClient] getSPLBalance called with invalid address:', walletAddress);
        return 0;
    }
    try {
        const response = await connection.getTokenAccountsByOwner(
            new PublicKey(walletAddress),
            { mint: new PublicKey(tokenMintAddress) }
        );
        
        if (response.value.length === 0) return 0;
        
        const accountInfo = await connection.getTokenAccountBalance(response.value[0].pubkey);
        return accountInfo.value.uiAmount || 0;
    } catch (error) {
        console.error(`[SolanaClient] Error fetching SPL balance for ${walletAddress}:`, error);
        return 0;
    }
};
