import { Schema, model, models, type InferSchemaType } from 'mongoose';

const adminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin'], default: 'admin' },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

export type AdminUserDocument = InferSchemaType<typeof adminUserSchema>;

export const AdminUser = models.AdminUser ?? model('AdminUser', adminUserSchema);