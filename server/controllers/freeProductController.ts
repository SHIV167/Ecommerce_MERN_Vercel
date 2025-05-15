import { Request, Response } from 'express';
import FreeProductModel from '../models/FreeProduct';

// Get all free products
export async function getAllFreeProducts(req: Request, res: Response) {
  try {
    const freeProducts = await FreeProductModel.find();
    res.json(freeProducts);
  } catch (error) {
    console.error('Get free products error:', error);
    res.status(500).json({ message: 'Error fetching free products' });
  }
}

// Get a single free product by ID
export async function getFreeProductById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const freeProduct = await FreeProductModel.findById(id);
    if (!freeProduct) {
      return res.status(404).json({ message: 'Free product not found' });
    }
    res.json(freeProduct);
  } catch (error) {
    console.error('Get free product error:', error);
    res.status(500).json({ message: 'Error fetching free product' });
  }
}

// Create a new free product
export async function createFreeProduct(req: Request, res: Response) {
  try {
    const { productId, minOrderValue } = req.body;
    const freeProduct = new FreeProductModel({ productId, minOrderValue });
    await freeProduct.save();
    res.status(201).json(freeProduct);
  } catch (error) {
    console.error('Create free product error:', error);
    res.status(500).json({ message: 'Error creating free product' });
  }
}

// Update a free product
export async function updateFreeProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { productId, minOrderValue } = req.body;
    const freeProduct = await FreeProductModel.findByIdAndUpdate(id, { productId, minOrderValue }, { new: true });
    if (!freeProduct) {
      return res.status(404).json({ message: 'Free product not found' });
    }
    res.json(freeProduct);
  } catch (error) {
    console.error('Update free product error:', error);
    res.status(500).json({ message: 'Error updating free product' });
  }
}

// Delete a free product
export async function deleteFreeProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const freeProduct = await FreeProductModel.findByIdAndDelete(id);
    if (!freeProduct) {
      return res.status(404).json({ message: 'Free product not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Delete free product error:', error);
    res.status(500).json({ message: 'Error deleting free product' });
  }
}
