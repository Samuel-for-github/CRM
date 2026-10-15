import { Schema, model, models, type InferSchemaType, type Types } from 'mongoose';

const customerNoteSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'AdminUser', required: false, index: true },
    note: { type: String, required: true, trim: true },
    visibility: { type: String, enum: ['internal'], default: 'internal' }
  },
  { timestamps: true }
);

export type CustomerNoteDocument = InferSchemaType<typeof customerNoteSchema> & { _id: Types.ObjectId };

export const CustomerNote = models.CustomerNote ?? model('CustomerNote', customerNoteSchema);