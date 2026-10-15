import { Schema, model, models, type InferSchemaType, type Types } from 'mongoose';

const syncLogSchema = new Schema(
  {
    syncType: { type: String, required: true, enum: ['customers', 'orders', 'webhook', 'initial-import', 'manual'] , index: true },
    status: { type: String, required: true, enum: ['success', 'partial', 'error'], index: true },
    source: { type: String, default: 'woocommerce' },
    startedAt: { type: Date, required: true },
    finishedAt: { type: Date },
    recordsProcessed: { type: Number, default: 0 },
    recordsUpserted: { type: Number, default: 0 },
    recordsFailed: { type: Number, default: 0 },
    message: { type: String, default: '' },
    details: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

syncLogSchema.index({ syncType: 1, startedAt: -1 });

export type SyncLogDocument = InferSchemaType<typeof syncLogSchema> & { _id: Types.ObjectId };

export const SyncLog = models.SyncLog ?? model('SyncLog', syncLogSchema);