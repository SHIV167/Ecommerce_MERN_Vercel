import { Request, Response } from 'express';
import mongoose from 'mongoose';
import TestimonialModel from '../models/Testimonial';

// Get all testimonials
export const getAllTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await TestimonialModel.find().sort({ createdAt: -1 });
    return res.status(200).json(testimonials);
  } catch (error: unknown) {
    console.error('Error fetching testimonials:', error);
    return res.status(500).json({ message: 'Failed to fetch testimonials', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Get featured testimonials with optional limit
export const getFeaturedTestimonials = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 3;
    const testimonials = await TestimonialModel.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(limit);
    return res.status(200).json(testimonials);
  } catch (error: unknown) {
    console.error('Error fetching featured testimonials:', error);
    return res.status(500).json({ message: 'Failed to fetch featured testimonials', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Get a single testimonial by ID
export const getTestimonialById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }
    const testimonial = await TestimonialModel.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    return res.status(200).json(testimonial);
  } catch (error: unknown) {
    console.error('Error fetching testimonial:', error);
    return res.status(500).json({ message: 'Failed to fetch testimonial', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Create a new testimonial (admin only)
export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const { name, content, rating, featured } = req.body;
    const testimonial = await TestimonialModel.create({ name, content, rating, featured });
    return res.status(201).json(testimonial);
  } catch (error: unknown) {
    console.error('Error creating testimonial:', error);
    return res.status(500).json({ message: 'Failed to create testimonial', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Update a testimonial by ID (admin only)
export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }
    const updates = req.body;
    const updated = await TestimonialModel.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    return res.status(200).json(updated);
  } catch (error: unknown) {
    console.error('Error updating testimonial:', error);
    return res.status(500).json({ message: 'Failed to update testimonial', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Delete a testimonial by ID (admin only)
export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }
    const deleted = await TestimonialModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    return res.status(200).json({ message: 'Testimonial deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting testimonial:', error);
    return res.status(500).json({ message: 'Failed to delete testimonial', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
