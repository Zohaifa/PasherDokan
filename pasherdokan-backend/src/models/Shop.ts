import mongoose, { Schema, Document } from 'mongoose';

interface IShop extends Document {
  name: string;
  type: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  shopkeeperId: Schema.Types.ObjectId;
  createdAt: Date;
}

const shopSchema: Schema<IShop> = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  shopkeeperId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

shopSchema.index({ location: '2dsphere' });

export default mongoose.model<IShop>('Shop', shopSchema);