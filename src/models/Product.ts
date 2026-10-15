import { Schema, model, models, type InferSchemaType, type Types } from 'mongoose';

const productSchema = new Schema(
  {
    wooProductId: { type: Number, unique: true, sparse: true, index: true },
    sku: { type: String, trim: true, lowercase: true, index: true, default: '' },
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, trim: true },
    description: { type: String, default: '' },
    type: { type: String, default: 'simple' },
    status: { type: String, enum: ['publish', 'draft', 'private'], default: 'publish', index: true },
    priceMinor: { type: Number, default: 0 },
    regularPriceMinor: { type: Number, default: 0 },
    salePriceMinor: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    stockStatus: { type: String, enum: ['instock', 'lowstock', 'outofstock', 'onbackorder'], default: 'instock', index: true },
    stockQuantity: { type: Number, default: 0 },
    manageStock: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    onSale: { type: Boolean, default: false },
    categories: [{ type: String }],
    images: [{ type: String }],
    syncedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', sku: 'text', description: 'text' });

export type ProductDocument = InferSchemaType<typeof productSchema> & { _id: Types.ObjectId };

export const Product = models.Product ?? model('Product', productSchema);
