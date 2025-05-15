import { Request, Response } from 'express';
import GiftCard from '../models/GiftCard';
import { v4 as uuidv4 } from 'uuid';

// Get all gift cards
export const getAllGiftCards = async (req: Request, res: Response) => {
  try {
    const cards = await GiftCard.find().sort({ createdAt: -1 });
    return res.status(200).json(cards);
  } catch (error) {
    console.error('Error fetching gift cards:', error);
    return res.status(500).json({ message: 'Error fetching gift cards', error });
  }
};

// Get gift card by ID
export const getGiftCardById = async (req: Request, res: Response) => {
  try {
    const card = await GiftCard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Gift card not found' });
    return res.status(200).json(card);
  } catch (error) {
    console.error('Error fetching gift card:', error);
    return res.status(500).json({ message: 'Error fetching gift card', error });
  }
};

// Create new gift card
export const createGiftCard = async (req: Request, res: Response) => {
  try {
    const { initialAmount, expiryDate, isActive } = req.body;
    const code = uuidv4().split('-')[0].toUpperCase();
    // Build data object, include uploaded image if present
    const cardData: any = {
      code,
      initialAmount,
      balance: initialAmount,
      expiryDate: new Date(expiryDate),
      isActive
    };
    if ((req as any).file) {
      cardData.imageUrl = `/uploads/${(req as any).file.filename}`;
    }
    const card = new GiftCard(cardData);
    await card.save();
    return res.status(201).json(card);
  } catch (error) {
    console.error('Error creating gift card:', error);
    return res.status(500).json({ message: 'Error creating gift card', error });
  }
};

// Update gift card
export const updateGiftCard = async (req: Request, res: Response) => {
  try {
    const { initialAmount, balance, expiryDate, isActive } = req.body;
    const card = await GiftCard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Gift card not found' });
    // Update fields if provided
    if (initialAmount !== undefined) card.initialAmount = initialAmount;
    if (balance !== undefined) card.balance = balance;
    if (expiryDate) card.expiryDate = new Date(expiryDate);
    if (isActive !== undefined) card.isActive = isActive;
    // Handle new image upload
    if ((req as any).file) {
      card.imageUrl = `/uploads/${(req as any).file.filename}`;
    }
    await card.save();
    return res.status(200).json(card);
  } catch (error) {
    console.error('Error updating gift card:', error);
    return res.status(500).json({ message: 'Error updating gift card', error });
  }
};

// Delete gift card
export const deleteGiftCard = async (req: Request, res: Response) => {
  try {
    const card = await GiftCard.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).json({ message: 'Gift card not found' });
    return res.status(200).json({ message: 'Gift card deleted successfully' });
  } catch (error) {
    console.error('Error deleting gift card:', error);
    return res.status(500).json({ message: 'Error deleting gift card', error });
  }
};
