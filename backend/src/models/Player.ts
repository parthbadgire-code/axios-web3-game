import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  roomId: string;
  username: string;
  web3Address: string;
  balance: number;
  asset: any | null;  // Mixed type — avoids Mongoose re-initializing with empty sub-doc defaults
  score: number;
  finalValue: number;
  mintedAt: Date | null;
  actionTaken: string | null;
  isOnline: boolean;
  socketId: string;
}

const PlayerSchema: Schema = new Schema({
  roomId: { type: String, required: true },
  username: { type: String, required: true },
  web3Address: { type: String, required: true },
  balance: { type: Number, default: 100 },
  // Using Mixed type so Mongoose never re-initialises with an empty sub-document
  asset: { type: Schema.Types.Mixed, default: null },
  score: { type: Number, default: 0 },
  finalValue: { type: Number, default: 0 },
  mintedAt: { type: Date, default: null },
  actionTaken: { type: String, default: null },
  isOnline: { type: Boolean, default: true },
  socketId: { type: String }
});

export default mongoose.model<IPlayer>('Player', PlayerSchema);
