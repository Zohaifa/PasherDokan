import mongoose, { Schema, Document } from 'mongoose';

interface IProduct extends Document {
  name: string;
  category: string;
  price: number;
  stock: number;
  shopId: Schema.Types.ObjectId;
  createdAt: Date;
}

const productSchema: Schema<IProduct> = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IProduct>('Product', productSchema);