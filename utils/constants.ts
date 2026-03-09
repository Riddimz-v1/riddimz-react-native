export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: '#2f95dc',
    tabIconDefault: '#ccc',
    tabIconSelected: '#2f95dc',
    primary: '#1DB954',
    secondary: '#f0f0f0',
    accent: '#FF0050',
  },
  dark: {
    text: '#fff',
    background: '#020102',
    tint: '#fff',
    tabIconDefault: '#ccc',
    tabIconSelected: '#fff',
    primary: '#7633b5', // Riddimz Purple
    secondary: '#252525',
    accent: '#d7475f', // Riddimz Pink/Red
  },
};

export const BRAND_GRADIENT = ['#7633b5', '#4d60c0', '#d7475f', '#50fdba'];

const SERVER_URL = 'https://riddimz-python.onrender.com';

export const BASE_URL = SERVER_URL;
export const API_URL = `${BASE_URL}/graphql`;
export const REST_API_URL = BASE_URL;
export const WS_URL = SERVER_URL.replace('https://', 'wss://');

export const WEB3_CONFIG = {
    rpcEndpoint: 'https://api.devnet.solana.com',// 'https://api.mainnet-beta.solana.com',
    tokenMintAddress: 'J4nz3ASeEpdNqZQjKU2MJrY5i7196uxxVXtyHdL9rwFR', 
    usdtMintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // Mainnet USDT
};
