import { Request, Response } from 'express';
import PromoTimer from '../models/PromoTimer';

// Get all promo timers
export async function getPromoTimers(req: Request, res: Response) {
  const timers = await PromoTimer.find();
  res.json(timers);
}

// Create new promo timer
export async function createPromoTimer(req: Request, res: Response) {
  const { productId, endTime, enabled } = req.body;
  const timer = new PromoTimer({ productId, endTime, enabled });
  await timer.save();
  res.status(201).json(timer);
}

// Update promo timer
export async function updatePromoTimer(req: Request, res: Response) {
  const { id } = req.params;
  const { productId, endTime, enabled } = req.body;
  const timer = await PromoTimer.findByIdAndUpdate(id, { productId, endTime, enabled }, { new: true });
  res.json(timer);
}

// Delete promo timer
export async function deletePromoTimer(req: Request, res: Response) {
  const { id } = req.params;
  await PromoTimer.findByIdAndDelete(id);
  res.json({ success: true });
}
