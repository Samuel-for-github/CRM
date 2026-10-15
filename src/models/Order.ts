import { Schema, model, models, type InferSchemaType, type Types } from 'mongoose';

const orderItemSchema = new Schema(
  {
    productId: { type: Number },
    sku: { type: String },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    priceMinor: { type: Number, required: true }
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    wooOrderId: { type: Number, unique: true, sparse: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', index: true, default: null },
    guestCustomerName: { type: String, trim: true },
    guestCustomerEmail: { type: String, trim: true, lowercase: true, index: true },
    status: { type: String, required: true, index: true },
    currency: { type: String, required: true, default: 'USD' },
    totalMinor: { type: Number, required: true },
    subtotalMinor: { type: Number, default: 0 },
    shippingMinor: { type: Number, default: 0 },
    taxMinor: { type: Number, default: 0 },
    paymentMethod: { type: String, default: '' },
    items: { type: [orderItemSchema], default: [] },
    createdAtWoo: { type: Date },
    syncedAt: { type: Date },
    rawStatusLabel: { type: String },
    metadata: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

orderSchema.index({ status: 1, customer: 1 });

export type OrderDocument = InferSchemaType<typeof orderSchema> & { _id: Types.ObjectId };

export const Order = models.Order ?? model('Order', orderSchema);