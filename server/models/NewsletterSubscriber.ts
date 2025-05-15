import mongoose, { Schema, Document } from 'mongoose';

export interface INewsletterSubscriber extends Document {
  email: string;
  subscribedAt: Date;
}

const newsletterSubscriberSchema: Schema<INewsletterSubscriber> = new Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
});

export default mongoose.model<INewsletterSubscriber>('NewsletterSubscriber', newsletterSubscriberSchema);
