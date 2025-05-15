import express, { Request, Response } from 'express';
import { sendMail } from '../utils/mailer';
import ScannerModel from '../models/Scanner'; 

const router = express.Router();

// Endpoint to share QR code via email
router.post('/share', async (req: Request, res: Response) => {
  try {
    const { email, qrCodeUrl } = req.body;

    if (!email || !qrCodeUrl) {
      return res.status(400).json({ message: 'Email and QR code URL are required' });
    }

    // Send email with QR code
    const htmlContent = `
      <p>Here is your QR code:</p>
      <img src="${qrCodeUrl}" alt="QR Code" />
      <p>Scan this code to access the product details.</p>
    `;

    await sendMail({
      to: email,
      subject: 'Your QR Code',
      html: htmlContent
    });

    return res.status(200).json({ message: 'QR code shared successfully via email' });
  } catch (error: unknown) {
    console.error('Error sharing QR code:', error);
    return res.status(500).json({ message: 'Failed to share QR code via email', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Endpoint to update coupon code for a scanner
router.patch('/admin/qr-scanner/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const scanner = await ScannerModel.findByIdAndUpdate(
      id,
      { couponCode },
      { new: true }
    );

    if (!scanner) {
      return res.status(404).json({ message: 'Scanner not found' });
    }

    return res.status(200).json({ message: 'Coupon code updated successfully', scanner });
  } catch (error: unknown) {
    console.error('Error updating coupon code:', error);
    return res.status(500).json({ message: 'Failed to update coupon code', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Endpoint to get scanner data when QR code is scanned
router.get('/scanners/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const scanner = await ScannerModel.findById(id);
    if (!scanner) {
      return res.status(404).json({ message: 'Scanner not found' });
    }
    // Increment scan count and update scannedAt
    scanner.scanCount += 1;
    scanner.scannedAt = new Date();
    await scanner.save();
    return res.status(200).json({ data: scanner.data, couponCode: scanner.couponCode, productId: scanner.productId });
  } catch (error: unknown) {
    console.error('Error retrieving scanner data:', error);
    return res.status(500).json({ message: 'Failed to retrieve scanner data', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Endpoint to retrieve scanner data including coupon code when a QR code is scanned
router.get('/scanners/:id/with-coupon', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const scanner = await ScannerModel.findById(id);
    if (!scanner) {
      return res.status(404).json({ message: 'Scanner not found' });
    }
    // Increment scan count and update scannedAt
    scanner.scanCount += 1;
    scanner.scannedAt = new Date();
    await scanner.save();
    return res.status(200).json({ data: scanner.data, couponCode: scanner.couponCode, productId: scanner.productId });
  } catch (error: unknown) {
    console.error('Error retrieving scanner data:', error);
    return res.status(500).json({ message: 'Failed to retrieve scanner data', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
