import { Schema, model, Document } from 'mongoose';

export interface IAnalyticsDay extends Document {
  date: string; // YYYY-MM-DD
  apiCalls: number;
  evaluations: number;
}

const AnalyticsDaySchema = new Schema<IAnalyticsDay>({
  date: { type: String, required: true, unique: true },
  apiCalls: { type: Number, default: 0 },
  evaluations: { type: Number, default: 0 },
});

export default model<IAnalyticsDay>('AnalyticsDay', AnalyticsDaySchema);
