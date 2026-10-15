import { Schema, model, models, type InferSchemaType, type Types } from 'mongoose';

const customerSchema = new Schema(
  {
    wooCustomerId: { type: Number, unique: true, sparse: true, index: true },
    source: { type: String, enum: ['woocommerce', 'crm'], default: 'crm', index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true, index: true },
    company: { type: String, trim: true },
    currency: { type: String, default: 'USD' },
    lifetimeValueMinor: { type: Number, default: 0 },
    lastOrderAt: { type: Date },
    orderCount: { type: Number, default: 0 },
    notesSummary: { type: String, default: '' },
    tags: [{ type: String }],
    syncedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

customerSchema.index({ firstName: 'text', lastName: 'text', email: 'text', phone: 'text' });

export type CustomerDocument = InferSchemaType<typeof customerSchema> & { _id: Types.ObjectId };

export const Customer = models.Customer ?? model('Customer', customerSchema);