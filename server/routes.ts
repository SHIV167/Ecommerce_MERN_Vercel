import { createServer, type Server } from "http";
import express, { Application, Request, Response, NextFunction } from "express";
import { MongoDBStorage } from "./storage/MongoDBStorage";
const storage = new MongoDBStorage();
import UserModel from "./models/User";
import SettingModel from "./models/Setting";
import ContactModel from "./models/Contact";
import BlogModel from "./models/Blog";
import OrderModel from "./models/Order"; // Import OrderModel
import ProductModel from "./models/Product"; // Import ProductModel
import BannerModel from "./models/Banner"; // Import BannerModel
import ScannerModel from "./models/Scanner"; // Import ScannerModel
import TestimonialModel from "./models/Testimonial"; // Import TestimonialModel for seeding
import FreeProductModel from "./models/FreeProduct"; // Import FreeProductModel

import { v4 as uuidv4 } from "uuid"; // Import uuid
import { z } from "zod";
import { CartItem, Product } from "../shared/schema";
import { categorySchema, collectionSchema, productSchema } from "@shared/schema";

type InsertProduct = Omit<Product, 'id' | '_id' | 'createdAt'>;
import { sendMail } from "./utils/mailer";
import upload from "./utils/upload";
import crypto from "crypto";
import { getServiceability, createShipment, cancelShipment, trackShipment } from "./utils/shiprocket";
import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import { getPopupSetting, updatePopupSetting } from "./controllers/popupSettingController";
import { subscribeNewsletter, getNewsletterSubscribers } from "./controllers/newsletterController";
import fs from "fs";
import path, { dirname } from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import PDFDocument from 'pdfkit';
// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

// Derive cookie domain: use explicit COOKIE_DOMAIN or fallback to root domain in production
function getCookieDomain(req: Request): string | undefined {
  if (COOKIE_DOMAIN) return COOKIE_DOMAIN;
  if (process.env.NODE_ENV === 'production') {
    const parts = req.hostname.split('.');
    const root = parts.slice(-2).join('.');
    return `.${root}`;
  }
  return undefined;
}

const cartItemInsertSchema = z.object({
  cartId: z.string(),
  productId: z.string(),
  quantity: z.number().min(1),
  isFree: z.boolean().optional()
});

// Order input validation
const orderInsertSchema = z.object({
  userId: z.string(),
  status: z.string(),
  totalAmount: z.number(),
  shippingAddress: z.string(),
  paymentMethod: z.string(),
  paymentStatus: z.string(),
  couponCode: z.string().nullable().optional(),
  discountAmount: z.number().optional().default(0),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingCountry: z.string().optional(),
  shippingPincode: z.string().optional(),
  shippingIsBilling: z.boolean().optional(),
  billingCustomerName: z.string().optional(),
  billingLastName: z.string().optional(),
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingCountry: z.string().optional(),
  billingPincode: z.string().optional(),
  billingEmail: z.string().optional(),
  billingPhone: z.string().optional(),
});
const orderItemInsertSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
  price: z.number(),
});

// Payload schema: nested order and items
const orderPayloadSchema = z.object({
  order: orderInsertSchema,
  items: z.array(orderItemInsertSchema),
});

// Banner input validation schema
const bannerObjectSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  alt: z.string(),
  linkUrl: z.string().optional(),
  enabled: z.boolean(),
  position: z.number(),
  desktopImageUrl: z.string().url().optional(),
  mobileImageUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional()
});
const bannerSchema = bannerObjectSchema
  .refine(data => !!(data.desktopImageUrl || data.imageUrl), {
    message: 'desktopImageUrl or imageUrl is required', path: ['desktopImageUrl']
  })
  .refine(data => !!(data.mobileImageUrl || data.imageUrl), {
    message: 'mobileImageUrl or imageUrl is required', path: ['mobileImageUrl']
  });
const bannerUpdateSchema = bannerObjectSchema.partial();

// Import routes
import couponRoutes from './routes/couponRoutes';
import giftCardRoutes from './routes/giftCardRoutes';
import giftCardTemplateRoutes from './routes/giftCardTemplateRoutes';
import authRoutes from './routes/authRoutes'; // Import auth routes
import scannerRoutes from './routes/scannerRoutes'; // Import scanner routes
import testimonialRoutes from './routes/testimonialRoutes'; // Import testimonial routes
import freeProductRoutes from './routes/freeProductRoutes'; // Import freeProduct routes
import reviewRoutes from './routes/reviewRoutes'; // Import review routes

// Import controllers for coupons


export async function registerRoutes(app: Application): Promise<Server> {
  // Enable JSON and URL-encoded body parsing for incoming requests
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // Mount admin API routers
  app.use('/api', authRoutes);
  app.use('/api', couponRoutes);
  app.use('/api', giftCardRoutes);
  app.use('/api', giftCardTemplateRoutes);
  app.use('/api', scannerRoutes);
  app.use('/api', testimonialRoutes);
  app.use('/api', freeProductRoutes);
  app.use('/api', reviewRoutes); // Add review routes
  // ensure upload directory exists in public/uploads
  const uploadDir = path.join(__dirname, '../public/uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  // serve uploaded images
  app.use('/uploads', express.static(uploadDir));
  app.use('/admin/uploads', express.static(uploadDir));
  // local storage for product image uploads
  const localStorage = multer.diskStorage({ destination: uploadDir, filename: (req, file, cb) => {
      console.log('[UPLOAD] Saving file:', file.originalname);
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });
  const uploadLocal = multer({ storage: localStorage });

  // Seed sample blogs if none exist
  const blogCount = await BlogModel.estimatedDocumentCount();
  if (blogCount === 0) {
    await BlogModel.create([
      { title: 'Welcome to Our Blog', slug: 'welcome', author: 'Admin', summary: 'Start reading our latest news.', content: 'This is the first post content.', imageUrl: '', publishedAt: new Date() },
      { title: 'Getting Started', slug: 'getting-started', author: 'Admin', summary: 'How to get started.', content: 'Getting started content.', imageUrl: '', publishedAt: new Date() }
    ]);
  }

  // Seed sample testimonials if none exist
  const testimonialCount = await TestimonialModel.estimatedDocumentCount();
  if (testimonialCount === 0) {
    await TestimonialModel.create([
      { name: 'Priya S.', content: 'The Kumkumadi face oil has transformed my skin.', rating: 5, featured: true },
      { name: 'Rahul M.', content: 'I was skeptical about Ayurvedic hair care but Bringadi oil has proven me wrong.', rating: 5, featured: true },
      { name: 'Anita K.', content: 'The Rose Jasmine face cleanser is gentle yet effective.', rating: 4, featured: true }
    ]);
  }

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = req.body; // add validation with Zod schema
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      const hashed = await bcrypt.hash(validatedData.password, 10);
      const user = await storage.createUser({ ...validatedData, password: hashed });
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      
      // Send welcome email (async)
      sendMail({
        to: userWithoutPassword.email,
        subject: "Welcome to EcommercePro!",
        html: `<p>Hi ${userWithoutPassword.name || ''}, welcome to EcommercePro!</p>`
      }).catch(err => console.error("Email send error:", err));
      
      const token = jwt.sign(
        { id: userWithoutPassword.id, isAdmin: userWithoutPassword.isAdmin },
        process.env.JWT_SECRET as Secret,
        { expiresIn: process.env.JWT_EXPIRES_IN as any }
      );
      const maxAge = Number(process.env.COOKIE_MAX_AGE) || 86400000;
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV==='production', sameSite: 'none', maxAge, domain: getCookieDomain(req) });
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log(`Login attempt with email: ${email}`);
      
      if (!email || !password) {
        console.log("Login error: Email and password are required");
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      console.log(`User found: ${user ? 'Yes' : 'No'}`);
      
      if (!user || !(await bcrypt.compare(password, user.password))) {
        console.log("Login error: Invalid credentials");
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, we would use JWT tokens
      const { password: _, ...userWithoutPassword } = user;
      
      console.log("Login successful");
      const token = jwt.sign(
        { id: userWithoutPassword.id, isAdmin: userWithoutPassword.isAdmin },
        process.env.JWT_SECRET as Secret,
        { expiresIn: process.env.JWT_EXPIRES_IN as any }
      );
      const maxAge = Number(process.env.COOKIE_MAX_AGE) || 86400000;
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV==='production', sameSite: 'none', maxAge, domain: getCookieDomain(req) });
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Auth: logout (clear token)
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV==='production', sameSite: 'none', domain: getCookieDomain(req) });
    return res.status(200).json({ message: 'Logged out' });
  });

  // Password reset endpoints
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      // Fetch user document directly from MongoDB to ensure persistence
      const user = await UserModel.findOne({ email });
      if (!user) return res.status(200).json({ message: "If that email is registered, you will receive a password reset link" });
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as Secret, { expiresIn: process.env.RESET_PASSWORD_EXPIRES_IN as any || "1h" });
      // Save token and expiry on Mongoose document
      if (!user) {
        console.error('Forgot-password: no user found for update', email);
      } else {
        user.resetPasswordToken = token;
        user.resetPasswordExpire = new Date(Date.now() + parseInt(process.env.RESET_PASSWORD_EXPIRES_IN || '3600', 10) * 1000);
        await user.save();
        console.log('Forgot-password: reset token saved for user', email);
      }
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      const html = `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password. If you did not request this, ignore this email.</p>`;
      await sendMail({ to: user.email, subject: "Password Reset Request", html });
      return res.status(200).json({ message: "If that email is registered, you will receive a password reset link" });
    } catch (error) {
      console.error("Forgot password error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }
      let payload;
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET as Secret) as { id: string };
      } catch (err) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      const userRecord = await UserModel.findOne({
        id: payload.id,
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: new Date() },
      });
      if (!userRecord) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      const hashed = await bcrypt.hash(password, 10);
      userRecord.password = hashed;
      userRecord.resetPasswordToken = undefined;
      userRecord.resetPasswordExpire = undefined;
      await userRecord.save();
      return res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(400).json({ message: "Invalid or expired token" });
    }
  });

  // Popup settings routes
  app.get('/api/popup-settings', getPopupSetting);
  app.put('/api/popup-settings', updatePopupSetting);

  // Newsletter subscription routes
  app.post('/api/newsletter/subscribe', subscribeNewsletter);
  app.get('/api/newsletter/subscribers', getNewsletterSubscribers);

  // Banner routes
  app.get('/api/banners', async (req, res) => {
    try {
      const banners = await BannerModel.find();
      return res.status(200).json(banners);
    } catch (error) {
      console.error('Get banners error:', error);
      return res.status(500).json({ message: 'Error fetching banners' });
    }
  });

  app.post('/api/banners', upload.fields([{ name: 'desktopImage', maxCount: 1 }, { name: 'mobileImage', maxCount: 1 }]), async (req, res) => {
    try {
      const { title, subtitle, alt, linkUrl, enabled, position, desktopImageUrl, mobileImageUrl } = req.body;
      const id = uuidv4();
      let desktopUrl = desktopImageUrl;
      let mobileUrl = mobileImageUrl;
      const files = req.files as Record<string, Express.Multer.File[]>;
      if (files?.desktopImage) desktopUrl = `/uploads/${files.desktopImage[0].filename}`;
      if (files?.mobileImage) mobileUrl = `/uploads/${files.mobileImage[0].filename}`;
      const banner = new BannerModel({ id, title, subtitle, desktopImageUrl: desktopUrl, mobileImageUrl: mobileUrl, alt, linkUrl, enabled: enabled === 'true' || enabled === true, position: parseInt(position, 10) });
      await banner.save();
      return res.status(201).json(banner);
    } catch (error) {
      console.error('Create banner error:', error);
      return res.status(500).json({ message: 'Error creating banner' });
    }
  });

  app.put('/api/banners/:id', upload.fields([{ name: 'desktopImage', maxCount: 1 }, { name: 'mobileImage', maxCount: 1 }]), async (req, res) => {
    try {
      const { id } = req.params;
      const banner = await BannerModel.findOne({ id });
      if (!banner) return res.status(404).json({ message: 'Banner not found' });
      const { title, subtitle, alt, linkUrl, enabled, position, desktopImageUrl, mobileImageUrl } = req.body;
      let desktopUrl = desktopImageUrl;
      let mobileUrl = mobileImageUrl;
      const files = req.files as Record<string, Express.Multer.File[]>;
      if (files?.desktopImage) desktopUrl = `/uploads/${files.desktopImage[0].filename}`;
      if (files?.mobileImage) mobileUrl = `/uploads/${files.mobileImage[0].filename}`;
      banner.title = title;
      banner.subtitle = subtitle;
      banner.alt = alt;
      banner.linkUrl = linkUrl;
      banner.enabled = enabled === 'true' || enabled === true;
      banner.position = parseInt(position, 10);
      banner.desktopImageUrl = desktopUrl;
      banner.mobileImageUrl = mobileUrl;
      await banner.save();
      return res.status(200).json(banner);
    } catch (error) {
      console.error('Update banner error:', error);
      return res.status(500).json({ message: 'Error updating banner' });
    }
  });

  app.delete('/api/banners/:id', async (req, res) => {
    try {
      await BannerModel.deleteOne({ id: req.params.id });
      return res.status(204).end();
    } catch (error) {
      console.error('Delete banner error:', error);
      return res.status(500).json({ message: 'Error deleting banner' });
    }
  });

  // Collection products route
  app.get('/api/collections/:slug/products', async (req, res) => {
    try {
      const { slug } = req.params;
      const collection = await storage.getCollectionBySlug(slug);
      if (!collection) {
        return res.status(404).json({ message: 'Collection not found' });
      }
      const products = await storage.getCollectionProducts(collection._id!);
      return res.status(200).json(products);
    } catch (error) {
      console.error('Get collection products error:', error);
      return res.status(500).json({ message: 'Error fetching products for collection' });
    }
  });

  // Collection routes
  app.get('/api/collections', async (req, res) => {
    try {
      const collections = await storage.getCollections();
      return res.status(200).json(collections);
    } catch (err) {
      console.error('Fetch collections error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  app.get('/api/collections/:slug', async (req, res) => {
    try {
      const slug = req.params.slug;
      const col = await storage.getCollectionBySlug(slug);
      if (!col) return res.status(404).json({ message: 'Collection not found' });
      return res.status(200).json(col);
    } catch (err) {
      console.error('Fetch collection error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  // Admin: create collection
  app.post('/api/collections', async (req, res) => {
    try {
      const newCol = collectionSchema.parse(req.body);
      const created = await storage.createCollection(newCol);
      return res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: err.errors });
      }
      console.error('Create collection error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  // Admin: update collection
  app.put('/api/collections/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const update = collectionSchema.partial().parse(req.body);
      const updated = await storage.updateCollection(id, update);
      if (!updated) return res.status(404).json({ message: 'Collection not found' });
      return res.status(200).json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: err.errors });
      }
      console.error('Update collection error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  // Admin: delete collection
  app.delete('/api/collections/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const success = await storage.deleteCollection(id);
      if (!success) return res.status(404).json({ message: 'Collection not found' });
      return res.status(204).end();
    } catch (err) {
      console.error('Delete collection error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Fetch products in a collection
  app.get('/api/collections/:slug/products', async (req, res) => {
    try {
      const { slug } = req.params;
      const col = await storage.getCollectionBySlug(slug);
      if (!col) return res.status(404).json({ message: 'Collection not found' });
      // use getProducts with collectionId to fetch from Mongo
      const products = await storage.getProducts({ collectionId: col._id! });
      return res.status(200).json(products);
    } catch (err) {
      console.error('Fetch collection products error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  // Add product to collection
  app.post('/api/collections/:slug/products', async (req, res) => {
    try {
      const { slug } = req.params;
      const { productId } = req.body;
      const col = await storage.getCollectionBySlug(slug);
      if (!col) return res.status(404).json({ message: 'Collection not found' });
      const mapping = await storage.addProductToCollection({ productId, collectionId: col._id! });
      return res.status(201).json(mapping);
    } catch (err) {
      console.error('Add product to collection error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  // Remove product from collection
  app.delete('/api/collections/:slug/products/:productId', async (req, res) => {
    try {
      const { slug, productId } = req.params;
      const col = await storage.getCollectionBySlug(slug);
      if (!col) return res.status(404).json({ message: 'Collection not found' });
      const removed = await storage.removeProductFromCollection(productId, col._id!);
      if (!removed) return res.status(404).json({ message: 'Mapping not found' });
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Remove product from collection error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Product routes
  app.get('/api/products/featured', async (req, res) => {
    try {
      const limit = parseInt((req.query.limit as string) || '', 10) || undefined;
      const products = await storage.getFeaturedProducts(limit);
      return res.status(200).json(products);
    } catch (error) {
      console.error('Fetch featured products error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  app.get('/api/products/bestsellers', async (req, res) => {
    try {
      const limit = parseInt((req.query.limit as string) || '', 10) || undefined;
      const products = await storage.getBestsellerProducts(limit);
      return res.status(200).json(products);
    } catch (error) {
      console.error('Fetch bestseller products error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  app.get('/api/products/new', async (req, res) => {
    try {
      const limit = parseInt((req.query.limit as string) || '', 10) || undefined;
      const products = await storage.getNewProducts(limit);
      return res.status(200).json(products);
    } catch (error) {
      console.error('Fetch new products error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  app.get('/api/products', async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const offset = (page - 1) * limit;
      const search = (req.query.search as string) || "";
      const categoryId = req.query.categoryId as string | undefined;
      const collectionId = req.query.collectionId as string | undefined;

      // Fetch all matching products for accurate count and search
      const allProducts = await storage.getProducts({ categoryId, collectionId });
      let filteredProducts = allProducts;
      if (search) {
        const lower = search.toLowerCase();
        filteredProducts = allProducts.filter(p =>
          p.name.toLowerCase().includes(lower) ||
          (p.description?.toLowerCase().includes(lower))
        );
      }

      const total = filteredProducts.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const paginated = filteredProducts.slice(start, start + limit);

      return res.status(200).json({
        products: paginated,
        total,
        page,
        totalPages,
        totalItems: total
      });
    } catch (error) {
      console.error('Fetch products error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.get("/api/products/:idOrSlug", async (req, res, next) => {
    // Skip CSV endpoints to allow dedicated handlers
    if (req.params.idOrSlug === 'export' || req.params.idOrSlug === 'sample-csv') {
      return next();
    }
    try {
      const idOrSlug = req.params.idOrSlug;
    let product;

    // Try as MongoDB ObjectId first
    if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
      product = await storage.getProductById(idOrSlug);
    }

    // If not found, try as slug
    if (!product) {
      product = await storage.getProductBySlug(idOrSlug);
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(product);
    } catch (error) {
      console.error('Fetch product detail error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Export products as CSV
  app.get('/api/products/export', async (req, res) => {
    try {
      const products = await storage.getProducts();
      const header = ['sku','name','description','shortDescription','price','discountedPrice','stock','slug','featured','bestseller','isNew','videoUrl','imageUrl','images','categoryId','_id','rating','totalReviews'].join(',');
      const rows = products.map(p => [
        p.sku || '',
        `"${(p.name || '').replace(/"/g,'"\"')}"`,
        `"${(p.description || '').replace(/"/g,'"\"')}"`,
        `"${(p.shortDescription || '').replace(/"/g,'"\"')}"`,
        p.price || 0,
        p.discountedPrice || '',
        p.stock || 0,
        p.slug || '',
        p.featured || false,
        p.bestseller || false,
        p.isNew || false,
        p.videoUrl || '',
        p.imageUrl || '',
        `"${(p.images || []).join('|')}"`,
        p.categoryId || '',
        p._id || '',
        p.rating || 0,
        p.totalReviews || 0
      ].join(',')).join('\n');
      const csv = header + '\n' + rows;
      res.setHeader('Content-Type','text/csv');
      res.setHeader('Content-Disposition','attachment; filename="products.csv"');
      res.send(csv);
    } catch (err) {
      console.error('Export error:', err);
      res.status(500).json({ message: 'Export failed' });
    }
  });

  // Sample CSV for product import
  app.get('/api/products/sample-csv', (req, res) => {
    const header = ['sku','name','description','shortDescription','price','discountedPrice','stock','slug','featured','bestseller','isNew','videoUrl','imageUrl','images','categoryId','rating','totalReviews'].join(',');
    const example = ['EXAMPLE-SKU','Example Product','A sample description','Short desc','9.99','7.99','100','example-product','false','false','true','https://example.com/video.mp4','https://example.com/image.jpg','https://example.com/image1.jpg|https://example.com/image2.jpg','60f6e5b3c7c9126b8e3c1234','4.5','10'];
    const csv = header + '\n' + example.join(',');
    res.setHeader('Content-Type','text/csv');
    res.setHeader('Content-Disposition','attachment; filename="sample-products.csv"');
    res.send(csv);
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const userData = req.body;
      
      // Debug: log incoming update profile call
      console.log(`[PUT] /api/users/${userId}`, userData);
       
      // In a real app, verify the user is authorized
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string || "1");
      const limit = parseInt(req.query.limit as string || "10");
      const offset = (page - 1) * limit;
      const search = (req.query.search as string) || "";
      const categoryId = req.query.categoryId as string | undefined;
      const collectionId = req.query.collectionId as string | undefined;

      // Fetch all matching products for accurate count and search
      const allProducts = await storage.getProducts({ categoryId, collectionId });
      let filteredProducts = allProducts;
      if (search) {
        filteredProducts = allProducts.filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
        );
      }

      const totalProducts = filteredProducts.length;
      const totalPages = Math.ceil(totalProducts / limit);
      // Paginate results
      const pageProducts = filteredProducts.slice(offset, offset + limit);

      return res.status(200).json({
        products: pageProducts,
        total: totalProducts,
        page,
        totalPages,
        totalItems: totalProducts
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  
  app.get("/api/products/featured", async (req, res) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      
      const products = await storage.getFeaturedProducts(limitNum);
      
      return res.status(200).json(products);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/products/bestsellers", async (req, res) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      
      const products = await storage.getBestsellerProducts(limitNum);
      
      return res.status(200).json(products);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/products/new", async (req, res) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      
      const products = await storage.getNewProducts(limitNum);
      
      return res.status(200).json(products);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/products/:idOrSlug", async (req, res) => {
    try {
      const idOrSlug = req.params.idOrSlug;
      let product;

      // Try as MongoDB ObjectId first
      if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
        product = await storage.getProductById(idOrSlug);
      }

      // If not found, try as slug
      if (!product) {
        product = await storage.getProductBySlug(idOrSlug);
      }

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.status(200).json(product);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Create product with multiple images (robust handling for images and type conversion)
  app.post("/api/products", uploadLocal.array('images', 5), async (req, res) => {
    console.log('[PRODUCT CREATE] Incoming request:', {
      body: req.body,
      files: req.files,
      headers: req.headers
    });
    try {
      const productData = req.body;
      const files = req.files as Express.Multer.File[];
      // New uploaded images
      const newImages = files && files.length > 0 ? files.map(f => `/uploads/${f.filename}`) : [];
      // Parse existingImages from form (can be string or array)
      let existingImages: string[] = [];
      if (productData.existingImages) {
        if (Array.isArray(productData.existingImages)) {
          existingImages = productData.existingImages;
        } else if (typeof productData.existingImages === 'string') {
          existingImages = productData.existingImages.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }
      // Final images array: merge existing + new
      const images = [...existingImages, ...newImages];
      // Always set imageUrl to first image (if any)
      const imageUrl = images.length > 0 ? images[0] : undefined;
      // Convert types as needed
      const price = productData.price ? Number(productData.price) : undefined;
      const stock = productData.stock ? Number(productData.stock) : undefined;
      const discountedPrice = productData.discountedPrice ? Number(productData.discountedPrice) : undefined;
      if (!productData.name || price === undefined || !productData.slug) {
        console.error('[PRODUCT CREATE ERROR] Missing required fields:', { name: productData.name, price, slug: productData.slug });
        return res.status(400).json({ error: "Missing required fields" });
      }
      const existingProduct = await storage.getProductBySlug(productData.slug);
      if (existingProduct) {
        console.error('[PRODUCT CREATE ERROR] Duplicate slug:', productData.slug);
        return res.status(400).json({ error: "Product with this slug already exists" });
      }
      const newProduct = await storage.createProduct({
        ...productData,
        price,
        stock,
        discountedPrice,
        images,
        imageUrl
      });
      console.log('[PRODUCT CREATE] Success:', newProduct);
      return res.status(201).json(newProduct);
    } catch (error) {
      console.error('[PRODUCT CREATE ERROR]:', error);
      return res.status(500).json({ error: "Failed to create product", details: error instanceof Error ? error.message : error });
    }
  });

  // Update product with multiple images (MERGE EXISTING/NEW IMAGES)
  app.put("/api/products/:id", uploadLocal.array('images', 5), async (req, res) => {
    console.log('[PRODUCT UPDATE] Incoming request:', {
      params: req.params,
      body: req.body,
      files: req.files,
      headers: req.headers
    });
    try {
      const productId = req.params.id;
      const productData = req.body;
      const files = req.files as Express.Multer.File[];
      // Parse existingImages from form (can be string or array)
      let existingImages: string[] = [];
      if (productData.existingImages) {
        if (Array.isArray(productData.existingImages)) {
          existingImages = productData.existingImages;
        } else if (typeof productData.existingImages === 'string') {
          existingImages = productData.existingImages.split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }
      // New uploaded images
      const newImages = files && files.length > 0 ? files.map(f => `/uploads/${f.filename}`) : [];
      // Final images array: merge existing + new
      const images = [...existingImages, ...newImages];
      // Always set imageUrl to first image (if any)
      const imageUrl = images.length > 0 ? images[0] : undefined;
      const existingProduct = await storage.getProductById(productId);
      if (!existingProduct) {
        console.error('[PRODUCT UPDATE ERROR] Product not found:', productId);
        return res.status(404).json({ error: "Product not found" });
      }
      const updateData = { ...productData, images, imageUrl };
      const updatedProduct = await storage.updateProduct(productId, updateData);
      console.log('[PRODUCT UPDATE] Success:', updatedProduct);
      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error('[PRODUCT UPDATE ERROR]:', error);
      return res.status(500).json({ error: "Failed to update product", details: error instanceof Error ? error.message : error });
    }
  });
  
  app.delete("/api/products/:id", async (req, res) => {
    try {
      // Admin authentication is handled through cookies
      const productId = req.params.id;

    // Check if product exists
    const existingProduct = await storage.getProductById(productId);
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    await storage.deleteProduct(productId);
    return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Admin: delete product
  app.delete('/api/products/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const deleted = await storage.deleteProduct(id);
      if (!deleted) return res.status(404).json({ message: 'Product not found' });
      return res.json({ success: true });
    } catch (err) {
      console.error('Failed to delete product:', err);
      return res.status(500).json({ message: 'Failed to delete product' });
    }
  });

  // endpoint: upload multiple images for a product
  app.post('/api/products/:id/images', uploadLocal.array('images'), async (req, res) => {
    try {
      const { id } = req.params;
      const files = Array.isArray(req.files) ? req.files as Express.Multer.File[] : [];
      console.log(`[routes] /api/products/${id}/images - received files:`, files.map(f => f.originalname));
      const urls = files.map(f => `/uploads/${f.filename}`);
      // update product images array
      const updated = await ProductModel.findByIdAndUpdate(id, { $push: { images: { $each: urls } } }, { new: true });
      return res.json({ images: updated?.images || [] });
    } catch (err) {
      console.error('Image upload error:', err);
      return res.status(500).json({ message: 'Upload failed' });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/categories/featured", async (req, res) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      
      const categories = await storage.getFeaturedCategories(limitNum);
      
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/categories/:idOrSlug", async (req, res) => {
    try {
      const idOrSlug = req.params.idOrSlug;
    let category;

    // Try as MongoDB ObjectId first
    if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
      category = await storage.getCategoryById(idOrSlug);
    }

    // If not found, try as slug
    if (!category) {
      category = await storage.getCategoryBySlug(idOrSlug);
    }

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json(category);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = categorySchema.parse(req.body);
      
      const category = await storage.createCategory(validatedData);
      
      return res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/categories/:id", async (req, res) => {
    try {
      const categoryId = req.params.id;
      const categoryData = req.body;
      
      const updatedCategory = await storage.updateCategory(categoryId, categoryData);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      return res.status(200).json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const categoryId = req.params.id;
      
      const success = await storage.deleteCategory(categoryId);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Product-Collection routes
  app.post("/api/product-collections", async (req, res) => {
    try {
      const { productId, collectionId } = req.body;
      
      if (!productId || !collectionId) {
        return res.status(400).json({ message: "productId and collectionId are required" });
      }
      
      const productCollection = await storage.addProductToCollection({
        productId,
        collectionId
      });
      
      return res.status(201).json(productCollection);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/product-collections", async (req, res) => {
    try {
      const { productId, collectionId } = req.body;
      
      if (!productId || !collectionId) {
        return res.status(400).json({ message: "productId and collectionId are required" });
      }
      
      const success = await storage.removeProductFromCollection(
        productId,
        collectionId
      );
      
      if (!success) {
        return res.status(404).json({ message: "Product-Collection mapping not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Review routes
  app.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const productId = req.params.productId;
      
      const reviews = await storage.getProductReviews(productId);
      
      return res.status(200).json(reviews);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = req.body; // TODO: add validation
      
      const review = await storage.createReview(validatedData);
      
      return res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Testimonial routes
  app.get("/api/testimonials", async (req, res) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      
      const testimonials = await storage.getTestimonials(limitNum);
      
      return res.status(200).json(testimonials);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/testimonials/featured", async (req, res) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      
      const testimonials = await storage.getFeaturedTestimonials(limitNum);
      
      return res.status(200).json(testimonials);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/testimonials", async (req, res) => {
    try {
      const validatedData = req.body; // TODO: add validation
      
      const testimonial = await storage.createTestimonial(validatedData);
      
      return res.status(201).json(testimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Order routes
  app.post("/api/orders", async (req, res) => {
    try {
      const { order: orderData, items } = orderPayloadSchema.parse(req.body);
      const createdOrder = await storage.createOrder(orderData);
      const orderId = createdOrder.id;
      if (!orderId) return res.status(500).json({ message: "Order creation failed: missing ID" });
      for (const item of items) {
        await storage.addOrderItem({ orderId, productId: item.productId, quantity: item.quantity, price: item.price });
      }
      const createdItems = await storage.getOrderItems(orderId);
      const user = await storage.getUser(orderData.userId);
      const toEmail = orderData.billingEmail || user?.email;
      if (toEmail) {
        // Build HTML table for order details
        const rowsHtml = items.map(it => `
          <tr>
            <td>${it.productId}</td>
            <td>${it.quantity}</td>
            <td>₹${it.price.toFixed(2)}</td>
            <td>₹${(it.price * it.quantity).toFixed(2)}</td>
          </tr>
        `).join("");
        const html = `
          <h1>Order Confirmation - ${orderId}</h1>
          <p>Thank you for your purchase!</p>
          <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width:100%;">
            <thead>
              <tr><th>Product ID</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
            <tfoot>
              <tr><td colspan="3" align="right">Total Amount</td><td>₹${createdOrder.totalAmount.toFixed(2)}</td></tr>
            </tfoot>
          </table>
          <p>Shipping Address: ${createdOrder.shippingAddress}</p>
        `;
        sendMail({
          to: toEmail,
          subject: `Order Confirmation - ${orderId}`,
          html
        }).catch(err => console.error("Invoice email error:", err));
      }
      return res.status(201).json({ order: createdOrder, items: createdItems });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Create order error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  app.get("/api/orders", async (req, res) => {
    try {
      const { userId, page, limit, status, search, date } = req.query;
      if (userId) {
        // User orders (no pagination needed)
        const orders = await storage.getOrders(userId as string);
        return res.json(orders);
      }
      // Admin: filters, pagination, total count
      const query: Record<string, any> = {};
      if (status && status !== 'all') query.status = status;
      if (search) {
        query.$or = [
          { shippingAddress: { $regex: search, $options: 'i' } },
          { userId: { $regex: search, $options: 'i' } },
          { _id: { $regex: search, $options: 'i' } }
        ];
      }
      if (date && date !== 'all') {
        let start, end;
        if ((date as string).includes('_to_')) [start, end] = (date as string).split('_to_');
        else start = end = date;
        query.createdAt = {
          $gte: new Date(start + 'T00:00:00.000Z'),
          $lte: new Date(end + 'T23:59:59.999Z')
        };
      }
      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 10;
      const skip = (pageNum - 1) * limitNum;
      const total = await OrderModel.countDocuments(query);
      const orders = await OrderModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);
      const ordersList = orders.map((o) => o.toObject ? o.toObject() : o);
      return res.status(200).json({ orders: ordersList, total });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await storage.getOrderById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      const items = await storage.getOrderItems(orderId);
      return res.status(200).json({ order, items });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/orders/:id/items", async (req, res) => {
    try {
      const orderId = req.params.id;
      
      const orderItems = await storage.getOrderItems(orderId);
      
      return res.status(200).json(orderItems);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // --- Remove duplicate update order endpoints and keep only the correct one (PUT /api/orders/:id) ---
  // Remove the old endpoint for /api/orders/:id/status
  // The correct endpoint is:
  app.put('/api/orders/:id', async (req, res) => {
    const { id } = req.params;
    const { status, packageLength, packageBreadth, packageHeight, packageWeight } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });

    // Use admin authentication middleware here in production
    try {
      // Update status and dimensions in DB
      const updateData: any = { status };
      if (packageLength !== undefined) updateData.packageLength = packageLength;
      if (packageBreadth !== undefined) updateData.packageBreadth = packageBreadth;
      if (packageHeight !== undefined) updateData.packageHeight = packageHeight;
      if (packageWeight !== undefined) updateData.packageWeight = packageWeight;
      let orderDoc = await OrderModel.findByIdAndUpdate(id, updateData, { new: true });
      if (!orderDoc) return res.status(404).json({ message: 'Order not found' });
      const order = orderDoc.toObject();
      // Shiprocket integration based on status
      if (status === 'shipped') {
        const items = await storage.getOrderItems(id);
        const shipResp = await createShipment(order, items);
        orderDoc = await OrderModel.findByIdAndUpdate(id, { shiprocketOrderId: shipResp.order_id }, { new: true });
      } else if (status === 'cancelled' && order.shiprocketOrderId) {
        await cancelShipment(order.shiprocketOrderId);
      }
      return res.status(200).json(orderDoc);
    } catch (err) {
      return res.status(500).json({ message: 'Failed to update order' });
    }
  });

  // Track Shiprocket order
  app.get('/api/orders/:id/track', async (req, res) => {
    const orderId = req.params.id;
    try {
      const order = await storage.getOrderById(orderId);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      const srId = (order as any).shiprocketOrderId;
      if (!srId) return res.status(400).json({ message: 'No Shiprocket order associated' });
      const trackData = await trackShipment(srId);
      return res.json(trackData);
    } catch (error) {
      console.error('TrackOrder error:', error);
      return res.status(500).json({ message: 'Failed to fetch tracking info' });
    }
  });

  // QR Scanner CRUD routes
  app.get('/api/scanners', async (req, res) => {
    try {
      const scanners = await ScannerModel.find().sort({ scannedAt: -1 });
      return res.json(scanners);
    } catch (err) {
      console.error('Get scanners error', err);
      return res.status(500).json({ message: 'Failed to fetch scanners' });
    }
  });
  app.get('/api/scanners/:id', async (req, res) => {
    try {
      const scanner = await ScannerModel.findById(req.params.id);
      if (!scanner) return res.status(404).json({ message: 'Scanner not found' });
      return res.json(scanner);
    } catch (err) {
      console.error('Get scanner error', err);
      return res.status(500).json({ message: 'Failed to fetch scanner' });
    }
  });
  app.post('/api/scanners', async (req, res) => {
    try {
      const { data, productId, scannedAt } = req.body;
      const scanDate = scannedAt ? new Date(scannedAt) : new Date();
      // Check if scanner record exists for this data
      let scanner = await ScannerModel.findOne({ data });
      if (scanner) {
        scanner.scanCount += 1;
        scanner.scannedAt = scanDate;
        const updated = await scanner.save();
        return res.status(200).json(updated);
      }
      // Create new scanner entry
      const newScanner = await ScannerModel.create({ data, productId, scannedAt: scanDate, scanCount: 1 });
      return res.status(201).json(newScanner);
    } catch (err) {
      console.error('Create scanner error', err);
      return res.status(500).json({ message: 'Failed to create scanner' });
    }
  });
  app.put('/api/scanners/:id', async (req, res) => {
    try {
      const { couponCode } = req.body;
      const scanner = await ScannerModel.findById(req.params.id);
      if (!scanner) return res.status(404).json({ message: 'Scanner not found' });
      scanner.couponCode = couponCode || undefined;
      const updated = await scanner.save();
      return res.json(updated);
    } catch (err) {
      console.error('Update scanner error', err);
      return res.status(500).json({ message: 'Failed to update scanner' });
    }
  });
  app.delete('/api/scanners/:id', async (req, res) => {
    try {
      const result = await ScannerModel.findByIdAndDelete(req.params.id);
      if (!result) return res.status(404).json({ message: 'Scanner not found' });
      return res.json({ success: true });
    } catch (err) {
      console.error('Delete scanner error', err);
      return res.status(500).json({ message: 'Failed to delete scanner' });
    }
  });

  // Endpoint: share QR via email
  app.post('/api/scanners/share', async (req, res) => {
    const { email, url, productName } = req.body;
    try {
      await sendMail({
        to: email,
        subject: 'Your QR Code',
        html: `<p>Here is your QR code link for ${productName || 'the product'}:</p>
               <p><a href="${url}">${url}</a></p>
               <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=200x200" alt="QR Code"/>`
      });
      return res.json({ success: true });
    } catch (error) {
      console.error('QR share email error:', error);
      return res.status(500).json({ message: 'Failed to send QR code via email' });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      const { userId, sessionId } = req.query;
      
      if (!userId && !sessionId) {
        return res.status(400).json({ message: "Either userId or sessionId is required" });
      }
      
      const userIdStr = userId as string;
      const sessionIdStr = sessionId as string;
      
      let cart = await storage.getCart(userIdStr, sessionIdStr);
      
      // Create cart if it doesn't exist
      if (!cart) {
        cart = await storage.createCart({
          userId: userIdStr,
          sessionId: sessionIdStr
        });
      }
      
      // Get cart items
      const cartItems = await storage.getCartItems(cart.id!);
      
      // Get product details for each cart item
      const cartItemsWithProduct = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      return res.status(200).json({
        ...cart,
        items: cartItemsWithProduct
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/cart/items", async (req, res) => {
    try {
      const { cartId, productId, quantity, isFree } = req.body;
      
      if (!cartId || !productId || !quantity) {
        return res.status(400).json({ message: "cartId, productId, and quantity are required" });
      }
      
      const validatedData = cartItemInsertSchema.parse({
        cartId,
        productId,
        quantity,
        isFree
      });
      
      const newItem = await storage.addCartItem({
        productId,
        quantity,
        cartId: cartId,
        isFree: false
      });
      return res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/cart/items/:id", async (req, res) => {
    try {
      const cartItemId = req.params.id;
      const { quantity } = req.body;
      
      if (quantity === undefined) {
        return res.status(400).json({ message: "Quantity is required" });
      }
      
      const updatedCartItem = await storage.updateCartItemQuantity(cartItemId, quantity);
      
      if (!updatedCartItem && quantity > 0) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      return res.status(200).json(updatedCartItem || { _id: cartItemId, deleted: true });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/cart/items/:id", async (req, res) => {
    try {
      const cartItemId = req.params.id;
      
      const success = await storage.removeCartItem(cartItemId);
      
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const cartId = req.params.id;
      
      const success = await storage.clearCart(cartId);
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Get eligible free products based on cart total
  app.get("/api/cart/:cartId/eligible-free-products", async (req, res) => {
    try {
      const { cartId } = req.params;
      
      // Get the cart with items
      const cart = await storage.getCartById(cartId);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      
      // Get cart items with product details
      const cartItemsWithProduct = await storage.getCartItemsWithProductDetails(cartId);
      
      // Calculate cart total
      let cartTotal = 0;
      cartItemsWithProduct.forEach((item: CartItem & { product: Product }) => {
        if (!item.isFree) { // Only count non-free items for the total
          cartTotal += (item.product.price * item.quantity);
        }
      });
      
      // Get all free products
      const freeProducts = await FreeProductModel.find().lean();
      
      // Filter for eligible free products based on cart total
      const eligibleFreeProducts = freeProducts.filter(freeProduct => {
        return cartTotal >= freeProduct.minOrderValue;
      });
      
      // Get full product details for eligible free products
      const productsWithDetails = [];
      for (const freeProduct of eligibleFreeProducts) {
        const product = await storage.getProductById(freeProduct.productId);
        if (product) {
          productsWithDetails.push({
            ...product,
            freeProductId: freeProduct._id,
            minOrderValue: freeProduct.minOrderValue
          });
        }
      }
      
      return res.status(200).json(productsWithDetails);
    } catch (error) {
      console.error('Get eligible free products error:', error);
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Add a free product to the cart
  app.post("/api/cart/:cartId/add-free-product", async (req, res) => {
    try {
      const { cartId } = req.params;
      const { productId, freeProductId } = req.body;
      
      if (!productId || !freeProductId) {
        return res.status(400).json({ message: "productId and freeProductId are required" });
      }
      
      // Verify this is a valid free product
      const freeProduct = await FreeProductModel.findById(freeProductId);
      if (!freeProduct) {
        return res.status(404).json({ message: "Free product not found" });
      }
      
      // Check if product ID matches
      if (freeProduct.productId !== productId) {
        return res.status(400).json({ message: "Product ID does not match free product record" });
      }
      
      // Get the cart with items
      const cart = await storage.getCartById(cartId);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      
      // Get cart items with product details
      const cartItemsWithProduct = await storage.getCartItemsWithProductDetails(cartId);
      
      // Calculate cart total
      let cartTotal = 0;
      cartItemsWithProduct.forEach((item: CartItem & { product: Product }) => {
        if (!item.isFree) { // Only count non-free items for the total
          cartTotal += (item.product.price * item.quantity);
        }
      });
      
      // Check if cart meets minimum order value
      if (cartTotal < freeProduct.minOrderValue) {
        return res.status(400).json({ 
          message: `Cart total must be at least ${freeProduct.minOrderValue} to qualify for this free product`,
          cartTotal,
          minimumRequired: freeProduct.minOrderValue
        });
      }
      
      // Check if this free product is already in the cart
      const existingFreeItem = cartItemsWithProduct.find((item: CartItem & { product: Product }) => 
        item.isFree && item.productId === productId
      );
      
      if (existingFreeItem) {
        return res.status(400).json({ message: "This free product is already in your cart" });
      }
      
      // Add the free product to the cart
      const newItem = await storage.addCartItem({
        productId,
        quantity: 1, // Free products always have quantity of 1
        cartId,
        isFree: true
      });
      
      return res.status(201).json(newItem);
    } catch (error) {
      console.error('Add free product error:', error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Admin: list all users
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await UserModel.find();
      const sanitized = users.map((u) => {
        const obj: any = u.toObject();
        delete obj.password;
        obj.id = obj._id.toString();
        return obj;
      });
      return res.status(200).json(sanitized);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Admin: update user
  app.put("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const { isAdmin } = req.body;
      const updated = await UserModel.findByIdAndUpdate(userId, { isAdmin }, { new: true });
      if (!updated) return res.status(404).json({ message: "User not found" });
      const obj: any = updated.toObject();
      delete obj.password;
      obj.id = obj._id.toString();
      return res.status(200).json(obj);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Admin: delete user
  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const result = await UserModel.deleteOne({ _id: userId });
      if (result.deletedCount === 0) return res.status(404).json({ message: "User not found" });
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Admin: get settings
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await SettingModel.findOne();
      if (!settings) return res.status(404).json({ message: "Settings not found" });
      return res.status(200).json(settings.toObject());
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Admin: update settings
  app.put("/api/admin/settings", async (req, res) => {
    try {
      const { siteName, maintenanceMode, supportEmail, razorpayKeyId, razorpayKeySecret, shiprocketApiKey, shiprocketApiSecret, shiprocketSourcePincode, shiprocketPickupLocation, shiprocketChannelId } = req.body;
      const updated = await SettingModel.findOneAndUpdate(
        {},
        { siteName, maintenanceMode, supportEmail, razorpayKeyId, razorpayKeySecret, shiprocketApiKey, shiprocketApiSecret, shiprocketSourcePincode, shiprocketPickupLocation, shiprocketChannelId },
        { new: true, upsert: true }
      );
      return res.status(200).json(updated!.toObject());
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Public: get Razorpay Key ID for frontend
  app.get('/api/config', async (req, res) => {
    try {
      const settings = await SettingModel.findOne();
      return res.json({ razorpayKeyId: settings?.razorpayKeyId });
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Create Razorpay order
  app.post('/api/razorpay/order', async (req, res) => {
    try {
      const { amount, currency } = req.body;
      // Validate inputs
      if (typeof amount !== 'number' || isNaN(amount) || typeof currency !== 'string') {
        return res.status(400).json({ message: 'Invalid order parameters', params: req.body });
      }
      // Load Razorpay keys from DB settings
      const settings = await SettingModel.findOne();
      if (!settings?.razorpayKeyId || !settings.razorpayKeySecret) {
        return res.status(500).json({ message: 'Razorpay not configured' });
      }
      // Dynamically import Razorpay in ESM
      const { default: RazorpayCls } = (await import('razorpay')) as any;
      const razor = new RazorpayCls({ key_id: settings.razorpayKeyId, key_secret: settings.razorpayKeySecret });
      const receipt = `order_rcptid_${Date.now()}`;
      const order = (await razor.orders.create({ amount, currency, receipt, payment_capture: true })) as any;
      return res.status(200).json({ orderId: order.id, amount: order.amount, currency: order.currency });
    } catch (error) {
      console.error('Razorpay order create error:', error);
      const msg = error instanceof Error ? error.message : JSON.stringify(error);
      return res.status(500).json({ message: `Failed to create order: ${msg}` });
    }
  });

  // Verify Razorpay payment
  app.post('/api/razorpay/verify', async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      // Load Razorpay secret, prefer DB but fallback to ENV
      const settings = await SettingModel.findOne();
      const secret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        return res.status(500).json({ message: 'Razorpay secret missing' });
      }
      const generatedSignature = crypto.createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
      if (generatedSignature === razorpay_signature) {
        return res.json({ valid: true });
      }
      return res.status(400).json({ valid: false });
    } catch (error) {
      console.error('Razorpay verify error:', error);
      return res.status(500).json({ message: 'Verification failed' });
    }
  });

  // Shiprocket: serviceability check
  app.post('/api/shiprocket/serviceability', async (req, res) => {
    try {
      const { delivery_pincode, weight, cod } = req.body;
      const settings = await SettingModel.findOne();
      if (!settings) return res.status(500).json({ message: 'Settings not found' });
      const result = await getServiceability({
        pickup_pincode: settings.shiprocketSourcePincode,
        delivery_pincode,
        weight,
        cod,
      });
      return res.json(result);
    } catch (error) {
      console.error('Serviceability error:', error);
      return res.status(500).json({ message: 'Serviceability check failed' });
    }
  });

  app.post('/api/shiprocket/serviceability', async (req, res) => {
    try {
      const { delivery_pincode, weight, cod } = req.body;
      const settings = await SettingModel.findOne();
      if (!settings) return res.status(500).json({ message: 'Settings not found' });
      const result = await getServiceability({
        pickup_pincode: settings.shiprocketSourcePincode,
        delivery_pincode,
        weight,
        cod,
      });
      return res.json(result);
    } catch (error) {
      console.error('Serviceability error:', error);
      return res.status(500).json({ message: 'Serviceability check failed' });
    }
  });

  // Create new order (with items)
  app.post('/api/orders', async (req, res) => {
    try {
      const { order, items } = orderPayloadSchema.parse(req.body);
      // Set initial status: prepaid orders => processing, COD orders => pending
      const initialStatus = order.paymentMethod.toLowerCase() === 'cod' ? 'pending' : 'processing';
      const orderToSave = { ...order, status: initialStatus };
      const createdOrder = await storage.createOrder(orderToSave);
      if (!createdOrder.id) {
        return res.status(500).json({ message: 'Order created without ID' });
      }
      const orderId = createdOrder.id!;
      for (const item of items) {
        await storage.addOrderItem({ ...item, orderId });
      }
      return res.status(201).json({ id: createdOrder.id! });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid order payload', errors: error.errors });
      }
      console.error('Order creation error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Contact form submission
  app.post('/api/contacts', async (req, res) => {
    try {
      const { name, email, country, mobile, comments } = req.body;
      const contact = await ContactModel.create({ name, email, country, mobile, comments });
      // send notification email
      sendMail({
        to: process.env.SUPPORT_EMAIL || email,
        subject: 'New Contact Us Submission',
        text: `Name: ${name}\nEmail: ${email}\nCountry: ${country}\nMobile: ${mobile}\nComments: ${comments}`
      });
      return res.status(201).json(contact);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to submit contact' });
    }
  });

  // Contacts API route
  app.get('/api/contacts', async (req, res) => {
    try {
      const contacts = await ContactModel.find().sort({ createdAt: -1 });
      return res.status(200).json(contacts);
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      return res.status(500).json({ message: 'Failed to fetch contacts' });
    }
  });

  // Get all contact submissions (admin)
  app.get('/api/contacts', async (req, res) => {
    try {
      const contacts = await ContactModel.find().sort({ createdAt: -1 });
      return res.json(contacts);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to fetch contacts' });
    }
  });

  // Public: get all blogs
  app.get('/api/blogs', async (req, res) => {
    try {
      const blogs = await BlogModel.find().sort({ publishedAt: -1 });
      return res.json(blogs);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to fetch blogs' });
    }
  });

  // Public: get blog by slug
  app.get('/api/blogs/:slug', async (req, res) => {
    try {
      const blog = await BlogModel.findOne({ slug: req.params.slug });
      if (!blog) return res.status(404).json({ message: 'Not found' });
      return res.json(blog);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to fetch blog' });
    }
  });

  // Admin: create blog
  app.post('/api/blogs', async (req, res) => {
    try {
      const data = req.body;
      const blog = await BlogModel.create(data);
      return res.status(201).json(blog);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to create blog' });
    }
  });

  // Admin: update blog
  app.put('/api/blogs/:id', async (req, res) => {
    try {
      const blog = await BlogModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!blog) return res.status(404).json({ message: 'Not found' });
      return res.json(blog);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to update blog' });
    }
  });

  // Admin: delete blog
  app.delete('/api/blogs/:id', async (req, res) => {
    try {
      await BlogModel.findByIdAndDelete(req.params.id);
      return res.json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to delete blog' });
    }
  });

  // Users API route
  app.get('/api/users', async (req, res) => {
    try {
      const users = await UserModel.find();
      res.status(200).json(users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.put('/api/users/:id', async (req, res) => {
    try {
      const { isAdmin } = req.body;
      const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        { isAdmin },
        { new: true }
      );
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.status(200).json(user);
    } catch (err) {
      console.error('Failed to update user:', err);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  app.delete('/api/users/:id', async (req, res) => {
    try {
      const user = await UserModel.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.status(200).json({ message: 'User deleted' });
    } catch (err) {
      console.error('Failed to delete user:', err);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // Admin dashboard endpoints
  app.get("/api/admin/dashboard/summary", async (req, res) => {
    try {
      const totalOrders = await OrderModel.countDocuments();
      const revenueResult = await OrderModel.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]);
      const totalRevenue = revenueResult[0]?.total || 0;
      const totalCustomers = await UserModel.countDocuments();
      const lowStockProducts = await ProductModel.countDocuments({ stock: { $lte: Number(process.env.LOW_STOCK_THRESHOLD) || 5 } });
      return res.json({ totalOrders, totalRevenue, totalCustomers, lowStockProducts });
    } catch (error) {
      console.error("Dashboard summary error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/dashboard/top-products", async (req, res) => {
    try {
      const limit = Number(process.env.TOP_PRODUCTS_LIMIT) || 5;
      const topProducts = await storage.getBestsellerProducts(limit);
      return res.json(topProducts);
    } catch (error) {
      console.error("Top products error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Recent orders route
  app.get("/api/orders", async (req, res) => {
    try {
      const limitParam = req.query.limit as string;
      const limit = limitParam ? parseInt(limitParam) : undefined;
      const orders = OrderModel.find().sort({ createdAt: -1 });
      if (limit) orders.limit(limit);
      const result = await orders.exec();
      return res.json(result);
    } catch (error) {
      console.error("Fetch orders error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Invoice download route
  app.get("/api/orders/:id/invoice", async (req, res) => {
    const id = req.params.id;
    const order = await storage.getOrderById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    const items = await storage.getOrderItems(id);
    const doc = new PDFDocument({ margin: 30 });
    res.setHeader("Content-Disposition", `attachment; filename=invoice_${id}.pdf`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);
    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${order.id}`);
    doc.text(`Date: ${order.createdAt.toISOString()}`);
    doc.text(`Status: ${order.status}`);
    doc.moveDown();
    doc.fontSize(14).text("Items:");
    items.forEach(item => {
      doc.fontSize(12).text(`${item.productId} x ${item.quantity} @ ₹${item.price.toFixed(2)} = ₹${(item.price * item.quantity).toFixed(2)}`);
    });
    doc.moveDown();
    doc.fontSize(12).text(`Total Amount: ₹${order.totalAmount.toFixed(2)}`);
    doc.end();
  });

  // Serviceability route
  app.get("/api/serviceability", async (req, res) => {
    try {
      const deliveryPincode = req.query.deliveryPincode as string;
      if (!deliveryPincode) return res.status(400).json({ message: "deliveryPincode is required" });
      const setting = await SettingModel.findOne();
      if (!setting) return res.status(500).json({ message: "Settings not found" });
      const pickup = setting.shiprocketSourcePincode;
      const data = await getServiceability({ pickup_pincode: pickup, delivery_pincode: deliveryPincode, weight: 1, cod: 1 });
      return res.json(data);
    } catch (error) {
      console.error("Serviceability check failed:", error);
      return res.status(500).json({ message: "Serviceability check failed" });
    }
  });

  // Import products from CSV
  app.post('/api/products/import', upload.single('file'), async (req, res) => {
    try {
      console.log('[IMPORT] Starting CSV import', { file: req.file });
      if (!req.file) return res.status(400).json({ message: 'CSV file is required' });
      
      const content = fs.readFileSync(path.join(__dirname, '../public/uploads', req.file.filename), 'utf8');
      console.log('[IMPORT] File read complete', { size: content.length });
      const lines = content.split(/\r?\n/).filter(line => line.trim());
      console.log('[IMPORT] Lines parsed', { count: lines.length });
      
      if (lines.length < 2) {
        return res.status(400).json({ message: 'CSV file must contain header and at least one data row' });
      }
      
      const [headerLine, ...dataLines] = lines;
      const headers = headerLine.split(',');
      console.log('[IMPORT] Headers', { headers: headers });
      const requiredFields = ['sku', 'name', 'price', 'stock', 'slug'];
      
      // Validate headers
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      if (missingFields.length > 0) {
        console.log('[IMPORT] Validation failed', { missing: missingFields });
        return res.status(400).json({ 
          message: `Missing required fields in CSV: ${missingFields.join(', ')}` 
        });
      }
      
      interface ProductRow {
        sku: string;
        status: string;
      }
      
      const results: ProductRow[] = [];
      const errors: {row: number; sku: string; error: string}[] = [];
      
      for (let i = 0; i < dataLines.length; i++) {
        console.log('[IMPORT] Processing row', { row: i+2, total: dataLines.length });
        const line = dataLines[i];
        // Handle CSV values that may contain commas inside quotes
        const values: string[] = [];
        let currentValue = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(currentValue);
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        
        // Add the last value
        values.push(currentValue);
        
        try {
          // Build product data from CSV values
          const data: Record<string, any> = {};
          
          headers.forEach((header, index) => {
            let value = values[index] || '';
            // Remove quotes
            if (value.startsWith('"') && value.endsWith('"')) {
              value = value.substring(1, value.length - 1);
            }
            data[header] = value;
          });
          
          // Apply conversions for all fields
          const product = {
            sku: String(data.sku || '').trim(),
            name: String(data.name || '').trim(),
            description: String(data.description || '').trim(),
            shortDescription: data.shortDescription,
            price: Number(data.price || 0),
            discountedPrice: data.discountedPrice ? Number(data.discountedPrice) : undefined,
            imageUrl: String(data.imageUrl || '').trim(),
            stock: Number(data.stock || 0),
            slug: String(data.slug || '').trim(),
            categoryId: String(data.categoryId || '').trim(),
            featured: data.featured === 'true',
            bestseller: data.bestseller === 'true',
            isNew: data.isNew === 'true',
            images: data.images ? String(data.images).split('|').filter(Boolean) : [],
            videoUrl: data.videoUrl
          };
          console.log('[IMPORT] Converted data', { sku: product.sku, name: product.name });
          // Validate required fields
          if (!product.sku) throw new Error('SKU is required');
          if (!product.name) throw new Error('Name is required');
          if (!product.slug) throw new Error('Slug is required');
          if (!product.imageUrl) throw new Error('Image URL is required');
          if (!product.categoryId) throw new Error('Category ID is required');
          if (isNaN(product.price)) throw new Error('Price must be a number');
          
          // Check if product exists
          const existing = await storage.getProductBySlug(product.slug);
          console.log('[IMPORT] Checking existing', { slug: product.slug, exists: !!existing });
          if (existing && existing._id) {
            // Update existing product
            await storage.updateProduct(existing._id.toString(), product);
            results.push({ sku: product.sku, status: 'updated' });
          } else {
            // Create new product
            await storage.createProduct(product as any);
            results.push({ sku: product.sku, status: 'created' });
          }
        } catch (error: any) {
          console.error('[IMPORT] Row error', { row: i+2, error: error.message });
          const sku = values[headers.indexOf('sku')] || 'unknown';
          errors.push({ row: i + 2, sku, error: error.message });
        }
      }
      
      // Clean up the temporary file
      console.log('[IMPORT] Cleanup', { file: req.file.path });
      const pathsToTry = [
        req.file.path,
        path.join(__dirname, '../public/uploads', req.file.filename)
      ];
      pathsToTry.forEach(filePath => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('[IMPORT] File deleted successfully', { file: filePath });
          } else {
            console.log('[IMPORT] File does not exist for deletion', { file: filePath });
          }
        } catch (unlinkError: any) {
          console.error('[IMPORT] Cleanup error for path', { file: filePath, error: unlinkError.message });
        }
      });
      return res.json({ 
        imported: results, 
        errors: errors,
        summary: {
          total: dataLines.length,
          success: results.length,
          failed: errors.length
        }
      });
    } catch (err: any) {
      console.error('[IMPORT] Fatal error', err);
      res.status(500).json({ message: `Import failed: ${err.message}` });
    }
  });

  // Authentication middleware
  const isAuthenticatedMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret);
      (req as any).user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
  };

  // Admin check middleware
  const isAdminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user || !(req as any).user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    next();
  };

  // Register routes
  app.use('/api/admin', authRoutes); 
  app.use('/api/admin', couponRoutes); 
  app.use('/api/admin', giftCardTemplateRoutes);
  app.use('/api/admin', giftCardRoutes);
  app.use('/api/admin', scannerRoutes); 
  app.use('/api/admin', testimonialRoutes);

  // Error handling middleware to ensure JSON responses
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  });

  const httpServer = createServer(app);
  return httpServer;
}
