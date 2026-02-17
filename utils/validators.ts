export const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateWalletAddress = (address: string) => {
    return address.length >= 32 && address.length <= 44; // Solana base58 length
};
