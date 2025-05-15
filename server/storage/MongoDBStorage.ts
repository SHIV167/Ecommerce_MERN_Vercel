import {
  Product,
  InsertProduct,
  Category,
  Collection,
  ProductCollection,
  User,
  InsertUser,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  Review,
  InsertReview,
  Testimonial,
  InsertTestimonial,
  Cart,
  InsertCart,
  CartItem,
  InsertCartItem,
  Banner,
  InsertBanner,
  InsertCategory,
  InsertCollection,
  InsertProductCollection
} from "../../shared/schema";
import { IStorage } from "../storage";

// Import Mongoose models
import UserModel, { IUser } from "../models/User";
import ProductModel, { IProduct } from "../models/Product";
import CategoryModel, { ICategory } from "../models/Category";
import CollectionModel, { ICollection } from "../models/Collection";
import ProductCollectionModel, { IProductCollection } from "../models/ProductCollection";
import OrderModel, { IOrder } from "../models/Order";
import OrderItemModel, { IOrderItem } from "../models/OrderItem";
import ReviewModel, { IReview } from "../models/Review";
import TestimonialModel, { ITestimonial } from "../models/Testimonial";
import CartModel, { ICart } from "../models/Cart";
import CartItemModel, { ICartItem } from "../models/CartItem";
import BannerModel, { IBanner } from "../models/Banner";
import mongoose from 'mongoose';

// Helper function to convert Mongoose document to regular object
// Always returns a valid object of type T
const convertToObject = <T>(doc: any): T => {
  if (!doc) throw new Error("Document to convert is undefined");
  const obj = doc.toObject();
  // Ensure both 'id' and '_id' are present and are strings
  if (obj._id && typeof obj._id === 'object' && obj._id.toHexString) {
    obj._id = obj._id.toHexString();
  }
  // Always override id with _id for consistency
  if (obj._id) {
    obj.id = obj._id;
  }
  return obj as T;
};

// Utility to convert Windows/local path to public URL
function toPublicUrl(filePath: string): string {
  if (!filePath) return filePath;
  // Always return as /uploads/filename.jpg
  // Remove any leading directories before /uploads/
  const normalized = filePath.replace(/\\/g, '/');
  const uploadsIdx = normalized.lastIndexOf('/uploads/');
  if (uploadsIdx !== -1) {
    return normalized.substring(uploadsIdx);
  }
  // If it's already just a filename, prepend /uploads/
  if (!normalized.startsWith('/uploads/')) {
    return '/uploads/' + normalized.replace(/^\/+/, '');
  }
  return normalized;
}

export class MongoDBStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    return user ? convertToObject<User>(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email });
    return user ? convertToObject<User>(user) : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = new mongoose.Types.ObjectId().toHexString();
    const newUser = new UserModel({
      ...user,
      id,
      isAdmin: false, // Default value, can be changed later by an admin
      createdAt: new Date()
    });
    await newUser.save();
    return convertToObject<User>(newUser);
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: userData },
      { new: true }
    );
    
    return updatedUser ? convertToObject<User>(updatedUser) : undefined;
  }

  // Product operations
  async getProducts(options: { limit?: number, offset?: number, categoryId?: string, collectionId?: string } = {}): Promise<Product[]> {
    let query: any = {};
    if (options.categoryId) {
      query.categoryId = options.categoryId;
    }
    let products: IProduct[];
    if (options.collectionId) {
      // Get product IDs from the collection
      const productCollections = await ProductCollectionModel.find({ collectionId: options.collectionId });
      const productIds = productCollections.map(pc => pc.productId);
      query._id = { $in: productIds };
    }
    let productsQuery = ProductModel.find(query);
    if (options.limit) {
      productsQuery = productsQuery.limit(options.limit);
    }
    if (options.offset) {
      productsQuery = productsQuery.skip(options.offset);
    }
    products = await productsQuery;
    // Fix imageUrl for each product
    return products.map(p => {
      const obj = convertToObject<Product>(p);
      if (obj.imageUrl) obj.imageUrl = toPublicUrl(obj.imageUrl);
      return obj;
    });
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const product = await ProductModel.findById(id);
    if (!product) return undefined;
    const obj = convertToObject<Product>(product);
    if (obj.imageUrl) obj.imageUrl = toPublicUrl(obj.imageUrl);
    return obj;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const product = await ProductModel.findOne({ slug });
    if (!product) return undefined;
    const obj = convertToObject<Product>(product);
    if (obj.imageUrl) obj.imageUrl = toPublicUrl(obj.imageUrl);
    return obj;
  }

  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    const query = ProductModel.find({ featured: true });
    
    if (limit) {
      query.limit(limit);
    }
    
    const products = await query;
    return products.map(p => convertToObject<Product>(p));
  }

  async getBestsellerProducts(limit?: number): Promise<Product[]> {
    const query = ProductModel.find({ bestseller: true });
    
    if (limit) {
      query.limit(limit);
    }
    
    const products = await query;
    return products.map(p => convertToObject<Product>(p));
  }

  async getNewProducts(limit?: number): Promise<Product[]> {
    const query = ProductModel.find({ isNew: true });
    
    if (limit) {
      query.limit(limit);
    }
    
    const products = await query;
    return products.map(p => convertToObject<Product>(p));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Convert imageUrl and images to public URLs before saving
    let imageUrl = product.imageUrl;
    if (imageUrl) imageUrl = toPublicUrl(imageUrl);
    let images = product.images;
    if (Array.isArray(images)) {
      images = images.map(toPublicUrl);
    }
    const id = new mongoose.Types.ObjectId().toHexString();
    const newProduct = new ProductModel({
      ...product,
      imageUrl,
      images,
      id,
      createdAt: new Date()
    });
    await newProduct.save();
    return convertToObject<Product>(newProduct);
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    // Convert imageUrl and images to public URLs before saving
    let imageUrl = productData.imageUrl;
    if (imageUrl) imageUrl = toPublicUrl(imageUrl);
    let images = productData.images;
    if (Array.isArray(images)) {
      images = images.map(toPublicUrl);
    }
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      { $set: { ...productData, imageUrl, images } },
      { new: true }
    );
    return updatedProduct ? convertToObject<Product>(updatedProduct) : undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await ProductModel.deleteOne({ _id: id });
    
    // Also delete the product from any collections
    await ProductCollectionModel.deleteMany({ productId: id }); // TODO: Update to use string IDs if productId is also migrated
    
    return result.deletedCount > 0;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    const categories = await CategoryModel.find();
    return categories.map(c => convertToObject<Category>(c));
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const category = await CategoryModel.findById(id);
    return category ? convertToObject<Category>(category) : undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const category = await CategoryModel.findOne({ slug });
    return category ? convertToObject<Category>(category) : undefined;
  }

  async getFeaturedCategories(limit?: number): Promise<Category[]> {
    const query = CategoryModel.find({ featured: true });
    
    if (limit) {
      query.limit(limit);
    }
    
    const categories = await query;
    return categories.map(c => convertToObject<Category>(c));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = new mongoose.Types.ObjectId().toHexString();
    const newCategory = new CategoryModel({
      ...category,
      id
    });
    await newCategory.save();
    return convertToObject<Category>(newCategory);
  }

  async updateCategory(id: string, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const updatedCategory = await CategoryModel.findByIdAndUpdate(
      id,
      { $set: categoryData },
      { new: true }
    );
    
    return updatedCategory ? convertToObject<Category>(updatedCategory) : undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await CategoryModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  // Collection operations
  async getCollections(): Promise<Collection[]> {
    const collections = await CollectionModel.find();
    return collections.map(c => convertToObject<Collection>(c));
  }

  async getCollectionById(id: string): Promise<Collection | undefined> {
    const collection = await CollectionModel.findById(id);
    return collection ? convertToObject<Collection>(collection) : undefined;
  }

  async getCollectionBySlug(slug: string): Promise<Collection | undefined> {
    const collection = await CollectionModel.findOne({ slug });
    return collection ? convertToObject<Collection>(collection) : undefined;
  }

  async getFeaturedCollections(limit?: number): Promise<Collection[]> {
    const query = CollectionModel.find({ featured: true });
    
    if (limit) {
      query.limit(limit);
    }
    
    const collections = await query;
    return collections.map(c => convertToObject<Collection>(c));
  }

  async createCollection(collection: InsertCollection): Promise<Collection> {
    const id = new mongoose.Types.ObjectId().toHexString();
    const newCollection = new CollectionModel({
      ...collection,
      id
    });
    await newCollection.save();
    return convertToObject<Collection>(newCollection);
  }

  async updateCollection(id: string, collectionData: Partial<InsertCollection>): Promise<Collection | undefined> {
    const updatedCollection = await CollectionModel.findByIdAndUpdate(
      id,
      { $set: collectionData },
      { new: true }
    );
    
    return updatedCollection ? convertToObject<Collection>(updatedCollection) : undefined;
  }

  async deleteCollection(id: string): Promise<boolean> {
    const result = await CollectionModel.deleteOne({ _id: id });
    
    // Also delete the collection relationships
    await ProductCollectionModel.deleteMany({ collectionId: id }); // TODO: Update to use string IDs if collectionId is also migrated
    
    return result.deletedCount > 0;
  }

  // Product-Collection mapping
  async addProductToCollection(productCollection: InsertProductCollection): Promise<ProductCollection> {
    const id = new mongoose.Types.ObjectId().toHexString();
    const newProductCollection = new ProductCollectionModel({
      ...productCollection,
      id
    });
    await newProductCollection.save();
    return convertToObject<ProductCollection>(newProductCollection);
  }

  async removeProductFromCollection(productId: string, collectionId: string): Promise<boolean> {
    const result = await ProductCollectionModel.deleteOne({ 
      productId, 
      collectionId 
    });
    
    return result.deletedCount > 0;
  }

  async getProductCollections(productId: string): Promise<Collection[]> {
    const productCollections = await ProductCollectionModel.find({ productId });
    const collectionIds = productCollections.map(pc => pc.collectionId);
    
    const collections = await CollectionModel.find({ 
      _id: { $in: collectionIds } 
    });
    
    return collections.map(c => convertToObject<Collection>(c));
  }

  async getCollectionProducts(collectionId: string): Promise<Product[]> {
    const productCollections = await ProductCollectionModel.find({ collectionId });
    const productIds = productCollections.map(pc => pc.productId);
    
    const products = await ProductModel.find({ 
      _id: { $in: productIds } 
    });
    
    return products.map(p => convertToObject<Product>(p));
  }

  // Order operations
  async getOrders(userId?: string, options?: { limit?: number, page?: number }): Promise<Order[]> {
    const query = userId ? { userId } : {};
    let ordersQuery = OrderModel.find(query);
    if (options && options.limit && options.page) {
      const limit = options.limit;
      const skip = (options.page - 1) * options.limit;
      ordersQuery = ordersQuery.skip(skip).limit(limit);
    }
    const orders = await ordersQuery;
    return orders.map(o => convertToObject<Order>(o));
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const order = await OrderModel.findById(id);
    return order ? convertToObject<Order>(order) : undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = new mongoose.Types.ObjectId().toHexString();
    const newOrder = new OrderModel({
      ...order,
      id,
      createdAt: new Date()
    });
    await newOrder.save();
    return convertToObject<Order>(newOrder);
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const updateData: any = { status };
    // Include package dimensions and Shiprocket ID
    if ((this as any).packageLength !== undefined) updateData.packageLength = (this as any).packageLength;
    if ((this as any).packageBreadth !== undefined) updateData.packageBreadth = (this as any).packageBreadth;
    if ((this as any).packageHeight !== undefined) updateData.packageHeight = (this as any).packageHeight;
    if ((this as any).packageWeight !== undefined) updateData.packageWeight = (this as any).packageWeight;
    if ((this as any).shiprocketOrderId) updateData.shiprocketOrderId = (this as any).shiprocketOrderId;
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    
    return updatedOrder ? convertToObject<Order>(updatedOrder) : undefined;
  }

  // Order item operations
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const orderItems = await OrderItemModel.find({ orderId });
    return orderItems.map(oi => convertToObject<OrderItem>(oi));
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    // Generate a new string ID (ObjectId)
    const id = new mongoose.Types.ObjectId().toHexString();
    const newOrderItem = new OrderItemModel({
      ...orderItem,
      id,
      orderId: orderItem.orderId,
      productId: orderItem.productId
    });
    
    await newOrderItem.save();
    return convertToObject<OrderItem>(newOrderItem);
  }

  // Review operations
  async getProductReviews(productId: string): Promise<Review[]> {
    const reviews = await ReviewModel.find({ productId });
    return reviews.map((r) => convertToObject<Review>(r));
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    const reviews = await ReviewModel.find({ userId });
    return reviews.map((r) => convertToObject<Review>(r));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = new mongoose.Types.ObjectId().toHexString();
    const newReview = new ReviewModel({
      ...review,
      id,
      createdAt: new Date()
    });
    await newReview.save();
    return convertToObject<Review>(newReview);
  }

  async updateReview(id: string, review: Partial<InsertReview>): Promise<Review | undefined> {
    const updatedReview = await ReviewModel.findByIdAndUpdate(
      id,
      { $set: review },
      { new: true }
    );
    return updatedReview ? convertToObject<Review>(updatedReview) : undefined;
  }

  async deleteReview(id: string): Promise<boolean> {
    const result = await ReviewModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  // Testimonial operations
  async getTestimonials(limit?: number): Promise<Testimonial[]> {
    const query = TestimonialModel.find();
    
    if (limit) {
      query.limit(limit);
    }
    
    const testimonials = await query;
    return testimonials.map(t => convertToObject<Testimonial>(t));
  }

  async getFeaturedTestimonials(limit?: number): Promise<Testimonial[]> {
    const query = TestimonialModel.find({ featured: true });
    
    if (limit) {
      query.limit(limit);
    }
    
    const testimonials = await query;
    return testimonials.map(t => convertToObject<Testimonial>(t));
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const id = new mongoose.Types.ObjectId().toHexString();
    const newTestimonial = new TestimonialModel({
      ...testimonial,
      id,
      createdAt: new Date()
    });
    await newTestimonial.save();
    return convertToObject<Testimonial>(newTestimonial);
  }

  // Cart operations
  async getCart(userId?: string, sessionId?: string): Promise<Cart | undefined> {
    const query: any = {};
    
    if (userId) {
      query.userId = userId;
    } else if (sessionId) {
      query.sessionId = sessionId;
    } else {
      return undefined;
    }
    
    const cart = await CartModel.findOne(query);
    return cart ? convertToObject<Cart>(cart) : undefined;
  }

  async getCartById(id: string): Promise<Cart | undefined> {
    const cart = await CartModel.findById(id);
    return cart ? convertToObject<Cart>(cart) : undefined;
  }

  async createCart(cart: InsertCart): Promise<Cart> {
    const id = new mongoose.Types.ObjectId().toHexString();
    const newCart = new CartModel({
      ...cart,
      id,
      createdAt: new Date()
    });
    await newCart.save();
    return convertToObject<Cart>(newCart);
  }

  // Cart item operations
  async getCartItems(cartId: string): Promise<CartItem[]> {
    const cartItems = await CartItemModel.find({ cartId });
    return cartItems.map(ci => convertToObject<CartItem>(ci));
  }

  async getCartItemsWithProductDetails(cartId: string): Promise<Array<CartItem & { product: Product }>> {
    const cartItems = await CartItemModel.find({ cartId });
    const result: Array<CartItem & { product: Product }> = [];
    
    for (const item of cartItems) {
      const cartItem = convertToObject<CartItem>(item);
      const product = await this.getProductById(cartItem.productId);
      
      if (product) {
        result.push({
          ...cartItem,
          product
        });
      }
    }
    
    return result;
  }

  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = await CartItemModel.findOne({
      cartId: cartItem.cartId,
      productId: cartItem.productId
    });
    if (existingItem) {
      // Update quantity instead
      existingItem.quantity += cartItem.quantity;
      await existingItem.save();
      return convertToObject<CartItem>(existingItem);
    }
    // Create new cart item with string id
    const id = new mongoose.Types.ObjectId().toHexString();
    const newCartItem = new CartItemModel({
      ...cartItem,
      id
    });
    await newCartItem.save();
    return convertToObject<CartItem>(newCartItem);
  }

  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined> {
    const updatedCartItem = await CartItemModel.findOneAndUpdate(
      { _id: id },
      { $set: { quantity } },
      { new: true }
    );
    
    return updatedCartItem ? convertToObject<CartItem>(updatedCartItem) : undefined;
  }

  async removeCartItem(id: string): Promise<boolean> {
    const result = await CartItemModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async clearCart(cartId: string): Promise<boolean> {
    const result = await CartItemModel.deleteMany({ cartId });
    return result.deletedCount > 0;
  }

  // Banner operations
  async getBanners(enabled?: boolean): Promise<Banner[]> {
    const query = enabled !== undefined ? { enabled } : {};
    const banners = await BannerModel.find(query).sort('position');
    return banners.map(b => convertToObject<Banner>(b));
  }

  async createBanner(banner: InsertBanner): Promise<Banner> {
    const id = new mongoose.Types.ObjectId().toHexString();
    // Handle fallback imageUrl
    const { desktopImageUrl, mobileImageUrl, imageUrl, ...rest } = banner as any;
    const desktop = desktopImageUrl ?? imageUrl;
    const mobile = mobileImageUrl ?? imageUrl;
    const newBanner = new BannerModel({
      ...rest,
      desktopImageUrl: desktop,
      mobileImageUrl: mobile,
      id
    });
    await newBanner.save();
    return convertToObject<Banner>(newBanner);
  }

  async updateBanner(id: string, bannerData: Partial<InsertBanner>): Promise<Banner> {
    // Handle fallback imageUrl on update
    const { desktopImageUrl, mobileImageUrl, imageUrl, ...rest } = bannerData as any;
    const desktop = desktopImageUrl ?? imageUrl;
    const mobile = mobileImageUrl ?? imageUrl;
    // Try both id and _id for update
    const updatedBanner = await BannerModel.findOneAndUpdate(
      { $or: [{ id }, { _id: id }] },
      { $set: { ...rest, desktopImageUrl: desktop, mobileImageUrl: mobile } },
      { new: true }
    );
    if (!updatedBanner) throw new Error('updateBanner returned undefined');
    return convertToObject<Banner>(updatedBanner);
  }

  async deleteBanner(id: string): Promise<boolean> {
    // Try deleting by both id and _id
    const result = await BannerModel.deleteOne({ $or: [{ id }, { _id: id }] });
    return result.deletedCount > 0;
  }
}