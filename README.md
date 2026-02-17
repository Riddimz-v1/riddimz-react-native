# Riddimz - Web3 Music App 🎵

Riddimz is a modern Web3 music application built with React Native and Expo, inspired by Spotify and TikTok. It features high-fidelity music streaming, P2P karaoke sessions, podcasts, and a music marketplace integrated with the Solana blockchain.

## 🚀 Key Features

- **Onboarding & Auth**: Secure onboarding flow with GDPR compliance and Solana wallet integration.
- **Home Feed**: High-performance "For You" feed using `@shopify/flash-list` for smooth 60fps scrolling.
- **Karaoke Room**: P2P singing sessions with real-time lyrics synchronization and sound sync using PeerJS.
- **Persistent Player**: A global MiniPlayer that persists across all screens for uninterrupted listening.
- **Marketplace**: Browse and purchase Music NFTs directly on the Solana blockchain.
- **Streaming**: TikTok-inspired vertical streaming feed with real-time gifting ($RDMZ tokens).
- **Global State**: centralized state management using `Zustand` with persistent storage.
- **Web3 Integration**: Solana Web3.js and Metaplex Umi for token transfers and NFT minting.

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev) (SDK 54+) + [Expo Router](https://docs.expo.dev/router/introduction/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **API**: GraphQL via [Apollo Client](https://www.apollographql.com/docs/react/)
- **Real-time**: [PeerJS](https://peerjs.com/) for P2P WebRTC
- **Web3**: [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/), [@metaplex-foundation/umi](https://github.com/metaplex-foundation/umi)
- **UI & Performance**: `@shopify/flash-list`, `react-native-reanimated`, `expo-av`, `expo-secure-store`
- **Styling**: Vanilla CSS / React Native StyleSheet (Premium Dark Theme Default)

## 📁 Project Structure

```bash
riddimz-react-native/
├── app/          # Expo Router (Tabs, Stacks, Redirects)
├── components/   # Atomic design (Atoms, Molecules, Organisms)
├── hooks/        # Domain-specific hooks (useWallet, useAudio, etc.)
├── services/     # API (GraphQL), Web3 (Solana), Realtime (PeerJS)
├── stores/       # Zustand global state
├── utils/        # Constants, Formatters, Validators
└── assets/       # Static assets (Images, Fonts, Sounds)
```

## 🏁 Getting Started

1.  **Clone the repository**
2.  **Install dependencies**
    ```bash
    npm install
    ```
3.  **Start the development server**
    ```bash
    npx expo start --clear
    ```

## 📜 Compliance & Security

- **GDPR**: User consent is stored securely using `expo-secure-store`.
- **Web3 Security**: Wallet interactions are modularized in `services/web3`.
- **AML/KYC**: Prepared for backend Chainalysis checks via Apollo auth interceptors.

## 📄 License

Private - (c) 2026 Riddimz
