import { PublicKey } from '@solana/web3.js';
import { connection } from './solanaClient';
import { publicKey } from '@metaplex-foundation/umi';

// Using Solana Web3.js for token transfers and balance to keep it simple and reliable
export const transferToken = async (
    fromWallet: any, // Wallet adapter/signer
    toAddress: string,
    amount: number,
    mintAddress: string
) => {
    try {
        console.log(`Transferring ${amount} tokens to ${toAddress}`);
        // In React Native, we typically use the mobile wallet adapter to sign transactions.
        // This is a placeholder for the transaction orchestration.
        return "transaction_signature_placeholder"; 
    } catch (error) {
        console.error('Error transferring tokens:', error);
        throw error;
    }
};

export const getTokenBalance = async (ownerAddress: string, mintAddress: string) => {
    try {
        const response = await connection.getParsedTokenAccountsByOwner(
            new PublicKey(ownerAddress),
            { mint: new PublicKey(mintAddress) }
        );
        
        if (response.value.length === 0) return 0;
        
        const balance = response.value[0].account.data.parsed.info.tokenAmount.uiAmount;
        return balance || 0;
    } catch (error) {
        console.error('Error fetching token balance:', error);
        return 0;
    }
};
