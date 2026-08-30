import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Room from './models/Room';
import Player from './models/Player';

dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/axios-web3-game';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ─── SCORING LOGIC ────────────────────────────────────────────────────────────
const TRAIT_SCORES: Record<string, number> = {
  Shades: 50,
  Crown: 80,
  Halo: 75,
  Wings: 120,
  'Cyber Armor': 150,
  Dragon: 200,
  'Pixel Aura': 90,
  Glitch: 250,
};

const RARITY_MAP: Record<string, string> = {
  Shades: 'Common',
  Crown: 'Uncommon',
  Halo: 'Uncommon',
  Wings: 'Rare',
  'Cyber Armor': 'Rare',
  Dragon: 'Epic',
  'Pixel Aura': 'Uncommon',
  Glitch: 'Legendary',
};

const CORE_BONUS: Record<string, number> = {
  ICE: 30,
  FIRE: 40,
  VOID: 60,
  ENERGY: 50,
};

const RARITY_ORDER = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

function calculateScore(asset: { core: string; traits: string[] }, remainingBalance: number, mintTimeMs: number): { score: number; rarity: string } {
  let score = 100; // base
  score += CORE_BONUS[asset.core] || 0;
  let highestRarityIdx = 0;
  for (const trait of asset.traits) {
    score += TRAIT_SCORES[trait] || 0;
    const rarityIdx = RARITY_ORDER.indexOf(RARITY_MAP[trait] || 'Common');
    if (rarityIdx > highestRarityIdx) highestRarityIdx = rarityIdx;
  }
  // Bonus for remaining balance (efficient spending)
  score += Math.floor(remainingBalance * 0.5);
  // Speed bonus: max 50 pts if minted within 30s
  const speedBonus = Math.max(0, 50 - Math.floor(mintTimeMs / 1000));
  score += speedBonus;

  const rarity = RARITY_ORDER[highestRarityIdx] || 'Common';
  return { score, rarity };
}

function applyMarketEvent(score: number, asset: { core: string; traits: string[] }, eventType: string): number {
  switch (eventType) {
    case 'GLITCH_UP':
      if (asset.traits.includes('Glitch')) return Math.floor(score * 2);
      break;
    case 'DRAGON_UP':
      if (asset.traits.includes('Dragon')) return Math.floor(score * 1.8);
      break;
    case 'FIRE_BONUS':
      if (asset.core === 'FIRE') return Math.floor(score * 1.25);
      break;
    case 'COMMON_DOWN':
      const allCommon = asset.traits.every(t => RARITY_MAP[t] === 'Common');
      if (allCommon) return Math.floor(score * 0.7);
      break;
    case 'VOID_UP':
      if (asset.core === 'VOID') return Math.floor(score * 1.5);
      break;
    case 'ENERGY_SURGE':
      if (asset.core === 'ENERGY') return Math.floor(score * 1.4);
      break;
    case 'ICE_FREEZE':
      if (asset.core === 'ICE') return Math.floor(score * 1.3);
      break;
    case 'CROWN_HYPE':
      if (asset.traits.includes('Crown')) return Math.floor(score * 1.5);
      break;
    case 'ARMOR_UP':
      if (asset.traits.includes('Cyber Armor')) return score + 500;
      break;
    case 'MARKET_CRASH':
      return Math.floor(score * 0.85); // Everyone drops 15%
    case 'STIMULUS':
      return Math.floor(score * 1.2); // Everyone gains 20%
  }
  return score;
}

// ─── TRAIT COSTS ─────────────────────────────────────────────────────────────
const TRAIT_COSTS: Record<string, number> = {
  Shades: 10,
  Crown: 20,
  Halo: 20,
  Wings: 30,
  'Cyber Armor': 40,
  Dragon: 50,
  'Pixel Aura': 25,
  Glitch: 70,
};

// ─── REST API ─────────────────────────────────────────────────────────────────
app.get('/api/asset/:uniqueId', async (req, res) => {
  try {
    const player = await Player.findOne({ 'asset.uniqueId': req.params.uniqueId });
    if (!player || !player.asset) return res.status(404).json({ error: 'Asset not found' });
    res.json({
      ...player.asset.toObject?.() ?? player.asset,
      username: player.username,
      web3Address: player.web3Address,
      score: player.score,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/room/:roomId/leaderboard', async (req, res) => {
  try {
    const players = await Player.find({ roomId: req.params.roomId }).sort({ score: -1 });
    res.json(players);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});


// ─── SOCKET.IO ────────────────────────────────────────────────────────────────
const mintStartTimes: Record<string, number> = {}; // track when minting phase started per room

// HELPER: Safely broadcast without O(N^2) explosion
async function broadcastPlayerUpdates(roomId: string) {
  const players = await Player.find({ roomId });
  io.to('admin-' + roomId).emit('playerListUpdate', players);
  io.to(roomId).emit('playerCountUpdate', players.length);
  return players;
}


io.on('connection', (socket) => {
  console.log('🔌 Connected:', socket.id);

  // HOST ONLY: Join admin room to receive heavy playerList updates
  socket.on('joinAdmin', (roomId: string) => {
    const cleanId = roomId.toUpperCase().trim();
    socket.join('admin-' + cleanId);
    console.log(`👑 Admin joined: admin-${cleanId}`);
  });

  // HOST: create or bind room
  socket.on('createRoom', async (roomId: string) => {
    try {
      const cleanId = roomId.toUpperCase().trim();
      let room = await Room.findOne({ roomId: cleanId });
      if (!room) {
        room = new Room({ roomId: cleanId, status: 'LOBBY' });
        await room.save();
      }
      socket.join(cleanId);
      socket.emit('roomCreated', { roomId: cleanId, status: room.status });
      // Also send current player list to admin
      const players = await Player.find({ roomId: cleanId });
      socket.emit('playerListUpdate', players);
      console.log(`🏠 Room ${cleanId} created/bound`);
    } catch (err) {
      console.error('createRoom error:', err);
      socket.emit('gameError', 'Failed to create room');
    }
  });

  // PLAYER: join room
  socket.on('joinRoom', async ({ roomId, username, web3Address }: { roomId: string; username: string; web3Address: string }) => {
    try {
      const cleanId = roomId.toUpperCase().trim();
      const cleanUsername = username.trim().slice(0, 16);

      const room = await Room.findOne({ roomId: cleanId });
      if (!room) {
        socket.emit('gameError', `Room "${cleanId}" not found. Check the room code.`);
        return;
      }

      // Check duplicate username (allow reconnection by same username)
      const existing = await Player.findOne({ roomId: cleanId, username: cleanUsername });
      if (existing) {
        if (existing.web3Address !== web3Address) {
          socket.emit('gameError', 'Username already taken in this room.');
          return;
        }

        if (existing.socketId !== socket.id) {
          // Reconnection - update socket ID
          existing.socketId = socket.id;
          existing.isOnline = true;
          await existing.save();
        }
        
        socket.join(cleanId);
        socket.emit('joined', existing.toObject());
        await broadcastPlayerUpdates(cleanId);
        socket.emit('gameStateUpdate', { status: room.status, marketEvent: room.marketEvent });
        console.log(`🔄 Reconnected: ${cleanUsername}`);
        return;
      }

      // Brand new player
      const player = new Player({
        roomId: cleanId,
        username: cleanUsername,
        web3Address,
        socketId: socket.id,
        isOnline: true,
        balance: 100,
        score: 0,
      });
      await player.save();

      socket.join(cleanId);
      socket.emit('joined', player.toObject());
      const players = await broadcastPlayerUpdates(cleanId);
      socket.emit('gameStateUpdate', { status: room.status, marketEvent: room.marketEvent });
      console.log(`👤 Joined: ${cleanUsername} → ${cleanId}`);
    } catch (err) {
      console.error('joinRoom error:', err);
      socket.emit('gameError', 'Failed to join room. Try again.');
    }
  });

  // HOST: update game state
  socket.on('updateGameState', async ({ roomId, status, marketEvent, eventType }: { roomId: string; status: string; marketEvent?: any; eventType?: string }) => {
    try {
      const cleanId = roomId.toUpperCase().trim();
      const updateData: any = { status };
      if (marketEvent !== undefined) updateData.marketEvent = marketEvent;

      const room = await Room.findOneAndUpdate(
        { roomId: cleanId },
        updateData,
        { returnDocument: 'after' }
      );

      if (!room) return;

      // ── KEY FIX: When transitioning to MINTING (new game round), reset all player assets ──
      if (status === 'MINTING') {
        await Player.updateMany(
          { roomId: cleanId },
          { $set: { asset: null, mintedAt: null, actionTaken: null, score: 0, finalValue: 0, balance: 100 } }
        );
        mintStartTimes[cleanId] = Date.now();
        console.log(`🔄 Reset all player assets for room ${cleanId}`);
      }

      // If moving to MARKET_EVENT, re-calculate scores based on event
      if (status === 'MARKET_EVENT' && eventType) {
        const players = await Player.find({ roomId: cleanId, asset: { $exists: true } });
        for (const p of players) {
          if (p.asset) {
            const newScore = applyMarketEvent(p.score, p.asset as any, eventType);
            p.score = newScore;
            await p.save();
          }
        }
      }

      const players = await Player.find({ roomId: cleanId });
      io.to(cleanId).emit('gameStateUpdate', { status: room.status, marketEvent: room.marketEvent });
      io.to(cleanId).emit('playerListUpdate', players);
      // ── Also send each player their updated personal data ──
      for (const p of players) {
        if (p.socketId) {
          io.to(p.socketId).emit('playerDataUpdate', p.toObject());
        }
      }
      console.log(`🎮 Room ${cleanId} → ${status}`);
    } catch (err) {
      console.error('updateGameState error:', err);
    }
  });

  // HOST: hard reset room (clear all players)
  socket.on('resetRoom', async ({ roomId }: { roomId: string }) => {
    try {
      const cleanId = roomId.toUpperCase().trim();
      await Room.findOneAndUpdate({ roomId: cleanId }, { status: 'LOBBY', marketEvent: null }, { returnDocument: 'after' });
      await Player.deleteMany({ roomId: cleanId });
      delete mintStartTimes[cleanId];
      io.to(cleanId).emit('gameStateUpdate', { status: 'LOBBY', marketEvent: null });
      io.to('admin-' + cleanId).emit('playerListUpdate', []);
      io.to(cleanId).emit('playerCountUpdate', 0);
      console.log(`🗑️ Room ${cleanId} reset`);
    } catch (err) {
      console.error('resetRoom error:', err);
    }
  });

  // PLAYER: mint asset
  socket.on('mintAsset', async ({ roomId, username, asset, traitCosts }: { roomId: string; username: string; asset: { core: string; traits: string[] }; traitCosts?: Record<string, number> }) => {
    try {
      const cleanId = roomId.toUpperCase().trim();

      // Validate player hasn't already minted
      const existing = await Player.findOne({ roomId: cleanId, username });
      if (!existing) { socket.emit('gameError', 'Player not found'); return; }
      if (existing.asset && (existing.asset as any).uniqueId) {
        socket.emit('assetMinted', existing.toObject());
        return; // Already minted
      }

      // Calculate actual trait cost
      let totalCost = 0;
      for (const trait of asset.traits) {
        totalCost += TRAIT_COSTS[trait] || 0;
      }
      if (totalCost > 100) {
        socket.emit('gameError', 'Insufficient balance to mint this asset');
        return;
      }

      const remainingBalance = 100 - totalCost;
      const mintTimeMs = mintStartTimes[cleanId] ? Date.now() - mintStartTimes[cleanId] : 60000;
      const { score, rarity } = calculateScore(asset, remainingBalance, mintTimeMs);
      const uniqueId = `AXIOS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const player = await Player.findOneAndUpdate(
        { roomId: cleanId, username },
        {
          asset: { ...asset, uniqueId, rarity },
          balance: remainingBalance,
          score,
          mintedAt: new Date(),
        },
        { returnDocument: 'after' }
      );

      socket.emit('assetMinted', player!.toObject());
      const players = await broadcastPlayerUpdates(cleanId);
      console.log(`🎨 Minted: ${username} → ${uniqueId} (score: ${score})`);
    } catch (err) {
      console.error('mintAsset error:', err);
      socket.emit('gameError', 'Minting failed. Try again.');
    }
  });



  // Disconnect
  socket.on('disconnect', async () => {
    console.log('🔌 Disconnected:', socket.id);
    try {
      const player = await Player.findOneAndUpdate(
        { socketId: socket.id },
        { isOnline: false },
        { returnDocument: 'after' }
      );
      if (player) {
        const players = await broadcastPlayerUpdates(player.roomId);
      }
    } catch (err) {}
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
