import { Schema, model, models, type InferSchemaType, type Types } from 'mongoose';

const followUpTaskSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true, index: true },
    priority: { type: String, required: true, enum: ['low', 'medium', 'high'], default: 'medium', index: true },
    status: { type: String, required: true, enum: ['pending', 'in progress', 'completed'], default: 'pending', index: true },
    completedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' }
  },
  { timestamps: true }
);

followUpTaskSchema.index({ customer: 1, status: 1, dueDate: 1 });

export type FollowUpTaskDocument = InferSchemaType<typeof followUpTaskSchema> & { _id: Types.ObjectId };

export const FollowUpTask = models.FollowUpTask ?? model('FollowUpTask', followUpTaskSchema);