import { Request, Response } from 'express';
import mongoose from 'mongoose';
import PopupSetting from '../models/PopupSetting';

// Get popup settings (singleton)
export async function getPopupSetting(req: Request, res: Response) {
  try {
    // Ensure we have a valid database connection before querying
    if (!mongoose.connection.readyState) {
      console.warn('MongoDB not connected, returning default popup settings');
      return res.json({
        enabled: false,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        bgImage: ''
      });
    }
    
    let setting = await PopupSetting.findOne();
    if (!setting) {
      console.log('No popup settings found, creating default');
      try {
        // Create default if not found
        setting = await PopupSetting.create({
          enabled: false,
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          bgImage: '',
        });
      } catch (createError) {
        console.error('Failed to create default popup settings:', createError);
        // Return default settings even if creation fails
        return res.json({
          enabled: false,
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          bgImage: ''
        });
      }
    }
    res.json(setting);
  } catch (error) {
    console.error('Error in getPopupSetting:', error);
    // Return default settings on error instead of error response
    res.json({
      enabled: false,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      bgImage: ''
    });
  }
}

// Update popup settings (singleton)
export async function updatePopupSetting(req: Request, res: Response) {
  try {
    console.log('Popup settings update request:', req.body);
    const { enabled, startDate, endDate, bgImage } = req.body;

    // Debug: Log types and values
    console.log('enabled:', enabled, typeof enabled);
    console.log('startDate:', startDate, typeof startDate);
    console.log('endDate:', endDate, typeof endDate);
    console.log('bgImage:', bgImage, typeof bgImage);

    // Relaxed validation for debugging
    if (typeof enabled !== 'boolean' ||
        !startDate ||
        !endDate ||
        !bgImage ||
        typeof bgImage !== 'string') {
      console.log('Validation failed');
      return res.status(400).json({ message: 'Invalid popup settings. All fields are required.' });
    }

    const setting = await PopupSetting.findOneAndUpdate(
      {},
      { enabled, startDate, endDate, bgImage },
      { new: true, upsert: true }
    );

    res.json(setting);
  } catch (error) {
    console.error('Popup settings update error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
}
