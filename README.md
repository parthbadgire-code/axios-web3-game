# AXIOS Web3 Game 🎮

A real-time, multiplayer interactive game designed for the **AXIOS Web3 Wing Orientation**. It introduces players to core Web3 concepts (wallets, minting, assets, market volatility) in a fun, gamified way—without requiring any actual blockchain knowledge or crypto wallets to play.

Developed with ❤️ by **Web3 Wing, Axios · IIITL**.

## Features

- **Instant Join**: Players are automatically assigned mock Web3 wallet addresses upon joining.
- **Dynamic Minting**: Players spend an initial balance of `$AXIOS` to pick a "Core" (Ice, Fire, Void, Energy) and up to two "Traits".
- **Asset Generation**: Assets are dynamically generated with unique visual styles, trait badges, and rarity tiers based on the player's choices.
- **Market Events**: The host can trigger market shifts (e.g., "Glitch traits are 2x more valuable") that instantly recalculate asset scores.
- **Decision Phase**: Players must decide whether to **HOLD** (gamble on the final market) or **SELL** (lock in current value).
- **Live Leaderboard**: Real-time ranking showing the richest players.
- **Shareable NFTs**: Players get a dedicated page for their minted "NFT" which they can download as a high-res image and share.
- **Host Dashboard**: A dedicated `/admin` panel with a fullscreen QR code generator, live player tracking, and phase control.

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Styling**: Vanilla CSS (Premium Glassmorphism + Dynamic Gradients)
- **Backend**: Node.js + Express + TypeScript
- **Real-time Sync**: Socket.io
- **Database**: MongoDB (via Mongoose)

## Local Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (or local MongoDB)

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder:
   ```env
   PORT=4000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```

## How to Play (Demo)

1. **Host**: Open `http://localhost:5173/admin`
2. Create a room (e.g., `AXIOS-2024`)
3. Display the QR code for players.
4. **Players**: Scan the QR code or go to `http://localhost:5173/join/AXIOS-2024`
5. The host uses the admin dashboard to step through the game phases: `LOBBY` → `MINTING` → `MARKET_EVENT` → `DECISION` → `LEADERBOARD` → `REVEAL`.

## License

This project is open-source and available under the MIT License.
