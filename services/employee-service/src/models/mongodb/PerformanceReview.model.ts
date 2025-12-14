import mongoose, { Schema, Document } from 'mongoose';

export interface IPerformanceReview extends Document {
  employeeId: string;
  reviewerId: string;
  reviewPeriod: string;
  goals?: string[];
  achievements?: string[];
  feedback?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PerformanceReviewSchema = new Schema<IPerformanceReview>(
  {
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    reviewerId: {
      type: String,
      required: true,
      index: true,
    },
    reviewPeriod: {
      type: String,
      required: true,
    },
    goals: {
      type: [String],
      default: [],
    },
    achievements: {
      type: [String],
      default: [],
    },
    feedback: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

PerformanceReviewSchema.index({ employeeId: 1, reviewPeriod: 1 });
PerformanceReviewSchema.index({ reviewerId: 1 });

export const PerformanceReview = mongoose.model<IPerformanceReview>(
  'PerformanceReview',
  PerformanceReviewSchema
);

