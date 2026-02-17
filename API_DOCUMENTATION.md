# Riddimz API Documentation

This document details the API endpoints for the Riddimz backend.
Base URL: `http://localhost:8000` (Local Development)

## 1. Authentication (`/auth`)

### Register
Create a new user account. This automatically generates a managed Solana wallet for the user.

- **Endpoint**: `POST /auth/register`
- **Body**:
  ```json
  {
    "username": "string",
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "jwt_token_string",
    "token_type": "bearer"
  }
  ```

### Login
Login with email and password.

- **Endpoint**: `POST /auth/login`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "jwt_token_string",
    "token_type": "bearer"
  }
  ```

### Google Auth
Login or register using Google OAuth.

- **Endpoint**: `POST /auth/google`
- **Body**:
  ```json
  {
    "id_token": "google_id_token_from_frontend"
  }
  ```
- **Response**: JWT Token (same as login)

- **Response**:
  ```json
  {
    "wallet_address": "SolanaAddress...",
    "private_key": "Base58EncodedPrivateKey...",
    "instructions": "KEEP THIS SECURE..."
  }
  ```

### Export Private Key
Export the private key of the managed wallet. **Protected Endpoint**.

- **Endpoint**: `GET /auth/export-key`
- **Query Params**:
  - `password`: Current user's password (for verification)
- **Response**:
  ```json
  {
    "wallet_address": "SolanaAddress...",
    "private_key": "Base58EncodedPrivateKey...",
    "secret_key": [1, 2, 3, ...], // Integer array (Uint8Array)
    "instructions": "KEEP THIS SECURE..."
  }
  ```

### Change Password
Change the password for the current logged-in user.
- **Endpoint**: `POST /auth/change-password`
- **Body**:
  ```json
  {
    "old_password": "currentpassword",
    "new_password": "newsecurepassword"
  }
  ```

### Forgot Password
Initiate password recovery flow.
- **Endpoint**: `POST /auth/forgot-password`
- **Body**: `{ "email": "user@example.com" }`
- **Response**: Generic success message.

### Reset Password
Reset password using a token received via email (logged to console in dev).
- **Endpoint**: `POST /auth/reset-password`
- **Body**:
  ```json
  {
    "token": "reset_token_string",
    "new_password": "newsecurepassword"
  }
  ```

---

## 2. User (`/user`)

### Get Profile
Get current logged-in user's profile.

- **Endpoint**: `GET /user/profile`
- **Response**:
  ```json
  {
    "id": 1,
    "username": "riddimz_user",
    "email": "user@example.com",
    "wallet_address": "SolanaAddress...",
    "is_managed_wallet": true,
    "is_active": true,
    "is_live": false,
    "profile_image_url": "http://...",
    "bio": "Music lover"
  }
  ```

### Update Profile
Update profile details.

- **Endpoint**: `PATCH /user/update`
- **Body**:
  ```json
  {
    "username": "new_name", // Optional
    "email": "new@email.com", // Optional
    "display_name": "John Doe", // Optional
    "bio": "New bio", // Optional
    "avatar_url": "http://..." // Optional
  }
  ```

### Get Earnings
Get user's total earnings from gifts and sales.

- **Endpoint**: `GET /user/earnings`
- **Response**:
  ```json
  {
    "user_id": 1,
    "total_earnings": 150.50, // Total $RDMZ earned
    "pending_earnings": 0.0
  }
  ```

---

## 3. Content (`/content`)

### List Tracks
Get a paginated list of tracks.

- **Endpoint**: `GET /content/tracks`
- **Query Params**: `skip` (default 0), `limit` (default 50)
- **Response**: Array of Track objects

### Create Track
Upload/Create a new track metadata.

- **Endpoint**: `POST /content/tracks`
- **Body**:
  ```json
  {
    "title": "My Song",
    "url": "https://storage.riddimz.io/song.mp3",
    "artist_id": 1,
    "is_nft": false,
    "lyrics": "Lalala..." // Optional
  }
  ```

### Podcast Series
Manage Podcast Series.

- **List**: `GET /content/podcasts`
- **Query Params**: `skip` (0), `limit` (50)
- **Create**: `POST /content/podcasts`
- **Body**:
  ```json
  {
    "title": "Tech Talk",
    "description": "Talking about tech",
    "cover_art_url": "http://...",
    "category": "Technology",
    "host_id": 1
  }
  ```

### Podcast Episodes
Manage Episodes for a Series.

- **List**: `GET /content/podcasts/{series_id}/episodes`
- **Query Params**: `skip` (0), `limit` (50)
- **Create**: `POST /content/episodes`
- **Body**:
  ```json
  {
    "series_id": 1,
    "title": "Ep 1: Intro",
    "url": "http://...",
    "duration_seconds": 1200
  }
  ```

### Search
Search tracks and podcasts.

- **Endpoint**: `GET /content/search?q=query_string`
- **Response**:
  ```json
  {
    "tracks": [...],
    "podcasts": [...]
  }
  ```

---

## 4. Marketplace (NFTs) (`/marketplace`)

### List NFTs
Get list of NFTs for sale.

- **Endpoint**: `GET /marketplace/listings`
- **Query Params**: `skip` (0), `limit` (50), `for_sale` (true)
- **Response**: Array of NFT objects

### Mint NFT (Master)
Mint a "Master" NFT for a track. **Artist Only**.

- **Endpoint**: `POST /marketplace/mint`
- **Body**:
  ```json
  {
    "track_id": 101,
    "price": 10.0, // Price in $RDMZ
    "supply": 100 // Total editions available
  }
  ```
- **Response**: NFT Object (Master)

### Buy NFT
Purchase an NFT. Mints a unique "Edition" to the buyer.

- **Endpoint**: `POST /marketplace/buy`
- **Body**:
  ```json
  {
    "nft_id": 500 // ID of the NFT listing (Master or Resale)
  }
  ```
- **Response**:
  ```json
  {
    "message": "Purchase successful",
    "tx_hash": "solana_transaction_signature"
  }
  ```

---

## 5. Token & Wallet (`/token`)

### Get Balance
Get $RDMZ token balance of the current user's managed wallet.

- **Endpoint**: `GET /token/balance`
- **Response**:
  ```json
  {
    "wallet_address": "...",
    "balance": 100.0
  }
  ```

### Gift Token (Direct)
Send $RDMZ directly to another wallet address.

- **Endpoint**: `POST /token/gift`
- **Body**:
  ```json
  {
    "recipient_wallet": "DestAddress...",
    "amount": 5.0,
    "message": "Thanks!"
  }
  ```

### Token Transfer
Transfer tokens (RDMZ, USDT, or SOL) silently via managed wallet.

- **Endpoint**: `POST /token/transfer`
- **Body**:
  ```json
  {
    "to_wallet": "DestAddress...",
    "amount": 10.0,
    "memo": "Payment for service"
  }
  ```
- **Response**:
  ```json
  {
    "tx_hash": "...",
    "status": "confirmed",
    "amount": 9.8
  }
  ```

### Burn Stats
Get latest token burn statistics.

- **Endpoint**: `GET /token/burn-stats`
- **Response**:
  ```json
  {
    "total_burned": 1000.5,
    "last_burn_tx": "...",
    "burn_count": 150
  }
  ```

### List Gifts
Get available tiered gifts (for streaming/UI).

- **Endpoint**: `GET /token/gifts`
- **Response**:
  ```json
  [
    {
      "id": 1,
      "name": "Rose",
      "value_rdmz": 1.0,
      "animation_type": "particles"
    },
    ...
  ]
  ```

### Stream Gift
Send a specific gift type during a stream (Background processed).

- **Endpoint**: `POST /token/stream-gift`
- **Body**:
  ```json
  {
    "recipient_user_id": 2, // Host ID
    "gift_name": "Rose"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Gift 'Rose' enqueued",
    "value": 1.0,
    "animation": "particles"
  }
  ```

---

## 6. Karaoke (`/karaoke`)

### Rooms
- **List**: `GET /karaoke/rooms`
- **Query Params**: `skip` (0), `limit` (20)
- **Create**: `POST /karaoke/rooms`
  - Body: `{"name": "Party Room"}`

### Join Approval
- **Request Join**: `POST /karaoke/rooms/{room_id}/request-join`
  - Allows a user to request participant status.
- **Approve User**: `POST /karaoke/rooms/{room_id}/approve/{user_id}` (Host only)
- **Reject User**: `POST /karaoke/rooms/{room_id}/reject/{user_id}` (Host only)

### Queue Management
- **Add Song**: `POST /karaoke/rooms/{room_id}/queue?track_id=123`
  - Restriction: Only Host or Approved Participants.
- **Next Song**: `POST /karaoke/rooms/{room_id}/next` (Host only)
- **End Session**: `POST /karaoke/rooms/{room_id}/end` (Host only)
  - Deactivates the room and notifies participants via WebSocket.

### Automated Lyrics Sync
- **Endpoint**: `POST /karaoke/sync`
- **Body** (Form Data):
  - `file`: MP3/WAV audio file
  - `room_id`: ID of the room
- **Response**:
  ```json
  {
    "room_id": "1",
    "instrumental_url": "/static/karaoke/1/instrumental.wav",
    "lyrics_vtt_url": "/static/karaoke/1/song.vtt",
    "full_lyrics": "Verse 1..."
  }
  ```

### Song Search & Download
- **Search Globally**: `GET /karaoke/search?query=song+name`
  - Uses `yt-dlp` to search YouTube/SoundCloud.
- **Download & Sync**: `POST /karaoke/sync-download`
  - Body (Form Data):
    - `url`: YouTube/SoundCloud URL
    - `room_id`: ID of the room
  - Automatically downloads, separates, and syncs.

### Gifting (Karaoke)
- **Gift Participant**: `POST /karaoke/rooms/{room_id}/gift`
  - Body:
    ```json
    {
      "recipient_user_id": 2,
      "gift_name": "Rose"
    }
    ```
  - Broadcasts animation to room and enqueues transfer.

### Realtime (WebSocket)
- **Endpoint**: `WS /karaoke/ws/join/{room_id}`
- **Events**:
  - `connected`: Initial connection
  - `queue_update`: When queue changes
  - `track_change`: When song changes
  - `chat`: User messages
  - `join_request`: When a user asks to join (notifies host)
  - `join_approved`: When a user is approved
  - `join_rejected`: When a user is rejected

---

## 7. Streaming (`/streaming`)

### Go Live
Generates stream key for the user.

- **Endpoint**: `POST /streaming/go-live`
- **Response**:
  ```json
  {
    "stream_key": "live_...",
    "rtmp_url": "rtmp://ingest.riddimz.io/live",
    "playback_url": "https://cdn.riddimz.io/hls/username.m3u8"
  }
  ```

### Feeds
Get list of live/trending streams.

- **Endpoint**: `GET /streaming/feeds`
- **Query Params**: `skip` (0), `limit` (20)

### Chat (WebSocket)
- **Endpoint**: `WS /streaming/ws/chat/{stream_id}`
- **Events**:
  - `chat`: Text messages
  - `gift`: Gift notifications

---

## 8. GraphQL API (`/graphql`)

For advanced querying and client-side flexibility (e.g., Apollo Client), Riddimz provides a GraphQL wrapper.

- **Endpoint**: `POST /graphql`
- **Playground**: `GET /graphql` (In browser)

### Example Query (Home Feed)
```graphql
query GetHomeFeed {
  tracks(limit: 5) {
    id
    title
    url
    artist {
      username
      displayName
    }
  }
  podcasts(limit: 5) {
    id
    title
    category
    episodes {
      title
      url
    }
  }
}
```

### Supported Types
- `UserType`
- `TrackType`
- `PodcastSeriesType`
- `PodcastEpisodeType`
- `KaraokeRoomType`

---

## 9. Tunneling with ngrok (External Access)

If you are using `ngrok` to expose your local server for testing on mobile or external devices, follow these steps:

### 0. Installation (Windows System-wide)
Since `ngrok` is not currently recognized, you can install it using one of these methods:

**Method A: Using Chocolatey (Recommended)**
Open a Terminal/PowerShell as Administrator and run:
```powershell
choco install ngrok
```

**Method B: Manual Download**
1. Download from [ngrok.com](https://ngrok.com/download).
2. Extract `ngrok.exe` to a folder (e.g., `C:\tools\ngrok`).
3. Add that folder to your System Environment Variables `PATH`.

### 1. Configure Auth Token
After installing, you must add your auth token from the ngrok dashboard:
```bash
ngrok config add-authtoken <YOUR_AUTH_TOKEN>
```

### 2. Start ngrok
Expose port 8000:
```bash
ngrok http 8000
```

### 2. Frontend Configuration
Set your `API_URL` to the ngrok URL (e.g., `https://random-id.ngrok-free.app`).

### 3. Required Header
Ngrok's free tier shows a landing page by default. To bypass this and ensure your API/Apollo requests work correctly, you **must** include the following header in all requests:

- **Header**: `ngrok-skip-browser-warning`
- **Value**: `any-value`

### 4. CORS Support
The backend is already configured to allow ngrok origins via a permissive development regex in `app/main.py`.
