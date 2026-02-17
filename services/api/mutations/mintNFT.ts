import { gql } from '@apollo/client';

export const MINT_NFT = gql`
  mutation MintNFT($metadataUri: String!) {
    mintNFT(metadataUri: $metadataUri) {
      success
      mintAddress
    }
  }
`;
