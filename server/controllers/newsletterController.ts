import { Request, Response } from 'express';
import NewsletterSubscriber from '../models/NewsletterSubscriber';

// Subscribe to newsletter
export async function subscribeNewsletter(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    const normalized = email.toLowerCase();
    const subscriber = await NewsletterSubscriber.findOneAndUpdate(
      { email: normalized },
      { $setOnInsert: { email: normalized, subscribedAt: new Date() } },
      { upsert: true, new: true }
    );
    // Send thank-you email
    import('../utils/mailer').then(({ sendMail }) => {
      sendMail({
        to: normalized,
        subject: 'Thank you for subscribing!',
        html: '<p>Thanks for subscribing to our newsletter!</p>'
      }).catch(err => console.error('Email send error:', err));
    });
    return res.json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Get all newsletter subscribers
export async function getNewsletterSubscribers(req: Request, res: Response) {
  try {
    const subs = await NewsletterSubscriber.find().sort({ subscribedAt: -1 });
    return res.json(subs);
  } catch (error) {
    console.error('Fetch subscribers error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
