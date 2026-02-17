import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata, fetchAllDigitalAssetByOwner, createNft, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey, generateSigner, percentAmount } from '@metaplex-foundation/umi';

// Setup Umi
const umi = createUmi('https://api.mainnet-beta.solana.com')
    .use(mplTokenMetadata());

export const fetchNFTs = async (ownerAddress: string) => {
    try {
        const owner = publicKey(ownerAddress);
        const assets = await fetchAllDigitalAssetByOwner(umi, owner);
        return assets;
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        return [];
    }
};

export const mintNFT = async (metadata: { name: string; uri: string; symbol: string }) => {
    try {
        const mint = generateSigner(umi);
        const { signature } = await createNft(umi, {
            mint,
            name: metadata.name,
            uri: metadata.uri,
            sellerFeeBasisPoints: percentAmount(0),
            symbol: metadata.symbol,
            // tokenStandard: TokenStandard.NonFungible, // Removed if type/version mismatch, createNft usually handles this
        }).sendAndConfirm(umi);
        
        console.log('NFT Minted! Signature:', signature);
        return mint.publicKey.toString();
    } catch (error) {
        console.error('Error minting NFT:', error);
        throw error;
    }
};
