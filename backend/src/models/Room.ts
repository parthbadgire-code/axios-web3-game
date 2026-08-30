import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomId: string;
  status: string; // LOBBY, MINTING, MARKET_EVENT, DECISION, LEADERBOARD, REVEAL
  marketEvent: any;
  createdAt: Date;
}

const RoomSchema: Schema = new Schema({
  roomId: { type: String, required: true, unique: true },
  status: { type: String, default: 'LOBBY' },
  marketEvent: { type: Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IRoom>('Room', RoomSchema);
