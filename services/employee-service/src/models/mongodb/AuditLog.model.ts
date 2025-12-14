import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    changes: {
      type: Schema.Types.Mixed,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

