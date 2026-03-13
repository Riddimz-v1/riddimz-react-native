export interface UserCreate {
  username: string;
  email: string;
  password: string;
  wallet_address?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
}

export interface UserResponse {
  id: number | string;
  user_id?: number | string; // Alias sometimes used in backend
  username: string;
  email: string;
  wallet_address: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  is_active: boolean;
  is_verified: boolean;
  is_live: boolean;
  current_stream_id: string | null;
  is_managed_wallet?: boolean;
}

export interface UserPublicResponse {
  id: number | string;
  user_id?: number | string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  is_active: boolean;
  is_verified: boolean;
  is_live: boolean;
  current_stream_id: string | null;
}

export interface UserEarnings {
  user_id: number | string;
  total_earnings: number;
  pending_earnings: number;
}

export interface WalletConnect {
  wallet_address: string;
  signature: string;
  message: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface TrackCreate {
  title: string;
  url: string;
  artist_id: string;
  is_nft: boolean;
  lyrics?: string;
}

export interface TrackResponse {
  id: string;
  title: string;
  url: string;
  cover_url?: string;
  artist: {
    id: string;
    username: string;
  };
  is_nft: boolean;
  lyrics?: string;
}

export interface SeriesCreate {
  title: string;
  host_id: string;
  description?: string;
  cover_art_url?: string;
  category?: string;
}

export interface SeriesResp {
  id: string;
  title: string;
  description?: string;
  cover_art_url?: string;
  host_id: string;
}

export interface EpisodeCreate {
  series_id: string;
  title: string;
  audio_url: string;
  summary?: string;
}

export interface EpisodeResp {
  id: string;
  series_id: string;
  title: string;
  audio_url: string;
  summary?: string;
}

export interface SearchResponse {
  tracks: TrackResponse[];
  podcasts: SeriesResp[];
}

export interface NFTResponse {
  id: string;
  track_id: string;
  owner_address: string;
  price: number;
  is_listed: boolean;
}

export interface NFTCreate {
  track_id: string;
  metadata_url: string;
}

export interface NFTPurchase {
  nft_id: string;
  buyer_wallet: string;
  signature: string;
}

export interface PurchaseStatus {
  success: boolean;
  transaction_id?: string;
  message?: string;
}

export interface StatusMessage {
  status: string;
  message: string;
}

export interface TokenBalance {
  balance: number;
  symbol: string;
  wallet_address?: string;
}

export interface TokenGift {
  recipient_wallet: string;
  amount: number;
  signature: string;
  message?: string;
}

export interface Gift {
  id: number;
  name: string;
  value_rdmz: number;
}

export interface ManagedWalletResponse {
  wallet_address: string;
  private_key: string;
  secret_key: number[];
  instructions: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface TokenTransfer {
  to_wallet: string;
  amount: number;
  memo?: string;
}

export interface TransferResponse {
  success: boolean;
  tx_hash: string;
}

export interface BurnStats {
  total_burned: number;
  last_burn_tx: string;
  burn_count: number;
}

export interface RoomCreate {
  name: string;
  is_private: boolean;
  description?: string;
  genre?: string;
}

export interface SoundtrackUploadResponse {
    success: boolean;
    track_url: string;
    lyrics_vtt_url?: string;
}

export interface LyricsSyncResponse {
  instrumental_url: string;
  vocals_url: string;
  vtt_url: string;
  lyrics: string;
}

export interface KaraokeTrack {
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
}

export interface KaraokeSearchResponse {
  tracks: KaraokeTrack[];
}

export interface GiftParticipantRequest {
  recipient_id: string;
  amount: number;
  gift_type: string;
}

export interface QueueItem {
  user_id: string;
  user_name: string;
  track_id: string;
  track_title: string;
  artist_id: string;
  lyrics?: string;
}

export interface RoomResponse {
  id: string;
  name: string;
  host_id: string;
  current_track_id?: string;
  current_participants: string[];
  queue: (string | QueueItem)[];
  soundtrack_url?: string;
  lyrics_url?: string;
}

export interface StreamConfig {
  stream_url: string;
  stream_key: string;
}

export interface FeedItem {
  id: string;
  type: 'track' | 'podcast' | 'stream';
  title: string;
  thumbnail_url?: string;
}
