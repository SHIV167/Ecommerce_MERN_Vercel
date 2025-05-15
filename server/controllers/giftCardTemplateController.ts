import { Request, Response } from 'express';
import GiftCardTemplate from '../models/GiftCardTemplate';

// Get all templates
export const getAllTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await GiftCardTemplate.find({ isActive: true }).sort({ initialAmount: 1 });
    return res.status(200).json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return res.status(500).json({ message: 'Error fetching templates', error });
  }
};

// Create new template
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const { initialAmount, expiryDate, isActive } = req.body;
    // handle uploaded image
    const templateData: any = { initialAmount, expiryDate, isActive };
    if (req.file) templateData.imageUrl = `/uploads/${req.file.filename}`;
    const template = new GiftCardTemplate(templateData);
    await template.save();
    return res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    return res.status(500).json({ message: 'Error creating template', error });
  }
};

// Update template
export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { initialAmount, expiryDate, isActive } = req.body;
    const template = await GiftCardTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    template.initialAmount = initialAmount;
    template.expiryDate = expiryDate;
    template.isActive = isActive;
    // update image if new file uploaded
    if (req.file) template.imageUrl = `/uploads/${req.file.filename}`;
    await template.save();
    return res.status(200).json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    return res.status(500).json({ message: 'Error updating template', error });
  }
};

// Delete template
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const template = await GiftCardTemplate.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    return res.status(200).json({ message: 'Template deleted' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return res.status(500).json({ message: 'Error deleting template', error });
  }
};
