import mongoose, { Schema, Document } from 'mongoose';

interface IOrderProduct {
  productId: Schema.Types.ObjectId;
  quantity: number;
}

interface IOrder extends Document {
  customerId: Schema.Types.ObjectId;
  shopId: Schema.Types.ObjectId;
  products: IOrderProduct[];
  totalPrice: number;
  status: 'pending' | 'shipped' | 'delivered';
  createdAt: Date;
}

const orderSchema: Schema<IOrder> = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
  products: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IOrder>('Order', orderSchema);