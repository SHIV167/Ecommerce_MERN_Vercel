import { Product, InsertProduct, Category, InsertCategory, Collection, InsertCollection, ProductCollection, InsertProductCollection, User, InsertUser, Order, InsertOrder, OrderItem, InsertOrderItem, Review, InsertReview, Testimonial, InsertTestimonial, Cart, InsertCart, CartItem, InsertCartItem, Banner, InsertBanner } from "../shared/schema";

// TODO: Define missing types (Banner, Order, OrderItem, Review, Testimonial, Cart, CartItem, User, InsertUser, etc.) or remove their usages if not needed.

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Product operations
  getProducts(options?: { limit?: number, offset?: number, categoryId?: string, collectionId?: string }): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getBestsellerProducts(limit?: number): Promise<Product[]>;
  getNewProducts(limit?: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getFeaturedCategories(limit?: number): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Collection operations
  getCollections(): Promise<Collection[]>;
  getCollectionById(id: string): Promise<Collection | undefined>;
  getCollectionBySlug(slug: string): Promise<Collection | undefined>;
  getFeaturedCollections(limit?: number): Promise<Collection[]>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: string, collection: Partial<InsertCollection>): Promise<Collection | undefined>;
  deleteCollection(id: string): Promise<boolean>;
  
  // Product-Collection mapping
  addProductToCollection(productCollection: InsertProductCollection): Promise<ProductCollection>;
  removeProductFromCollection(productId: string, collectionId: string): Promise<boolean>;
  getProductCollections(productId: string): Promise<Collection[]>;
  getCollectionProducts(collectionId: string): Promise<Product[]>;
  
  // Order operations
  getOrders(userId?: string, options?: { limit?: number, page?: number }): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  
  // Order item operations
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Review operations
  getProductReviews(productId: string): Promise<Review[]>;
  getUserReviews(userId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, review: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;
  
  // Testimonial operations
  getTestimonials(limit?: number): Promise<Testimonial[]>;
  getFeaturedTestimonials(limit?: number): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  // Cart operations
  getCart(userId?: string, sessionId?: string): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  
  // Cart item operations
  getCartItems(cartId: string): Promise<CartItem[]>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: string): Promise<boolean>;
  clearCart(cartId: string): Promise<boolean>;
  
  // Banner operations
  getBanners(enabled?: boolean): Promise<Banner[]>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  updateBanner(id: string, banner: Partial<InsertBanner>): Promise<Banner>;
  deleteBanner(id: string): Promise<boolean>;
}



// Utility to ensure both id and _id are present as string
function ensureId<T extends { id?: string; _id?: string }>(obj: T): T {
  if (!obj) return obj;
  if (!obj.id && obj._id) obj.id = obj._id;
  if (!obj._id && obj.id) obj._id = obj.id;
  return obj;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private categories: Map<string, Category>;
  private collections: Map<string, Collection>;
  private productCollections: Map<string, ProductCollection>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private reviews: Map<string, Review>;
  private testimonials: Map<string, Testimonial>;
  private carts: Map<string, Cart>;
  private cartItems: Map<string, CartItem>;
  private banners: Map<string, Banner>;
  private userId: string;
  private productId: string;
  private categoryId: string;
  private collectionId: string;
  private productCollectionId: string;
  private orderId: string;
  private orderItemId: string;
  private reviewId: string;
  private testimonialId: string;
  private cartId: string;
  private cartItemId: string;
  private bannerId: string;
  
  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.collections = new Map();
    this.productCollections = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.reviews = new Map();
    this.testimonials = new Map();
    this.carts = new Map();
    this.cartItems = new Map();
    this.banners = new Map();
    
    this.userId = '1';
    this.productId = '1';
    this.categoryId = '1';
    this.collectionId = '1';
    this.productCollectionId = '1';
    this.orderId = '1';
    this.orderItemId = '1';
    this.reviewId = '1';
    this.testimonialId = '1';
    this.cartId = '1';
    this.cartItemId = '1';
    this.bannerId = '1';
    
    // Initialize with some demo data
    this.initializeDemoData().catch(err => {
      console.error('Error initializing demo data:', err);
    });
  }

  private async initializeDemoData() {
    // Add demo categories
    const skinCare = await this.createCategory({
      name: "Skincare",
      description: "Ayurvedic skin care products",
      slug: "skincare",
      imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?ixlib=rb-4.0.3",
      featured: true
    });
    
    const hairCare = await this.createCategory({
      name: "Haircare",
      description: "Ayurvedic hair care products",
      slug: "haircare",
      imageUrl: "https://images.unsplash.com/photo-1574621100236-d25b64cfd647?ixlib=rb-4.0.3",
      featured: true
    });
    
    const bodycare = await this.createCategory({
      name: "Bath & Body",
      description: "Ayurvedic body care products",
      slug: "bath-body",
      imageUrl: "https://images.unsplash.com/photo-1627467959547-215304e0e8cc?ixlib=rb-4.0.3",
      featured: true
    });
    
    const wellness = await this.createCategory({
      name: "Wellness",
      description: "Ayurvedic wellness products",
      slug: "wellness",
      imageUrl: "https://images.unsplash.com/photo-1591084863828-30ebecaf2c82?ixlib=rb-4.0.3",
      featured: true
    });

    // Add demo collections
    const kumkumadi = await this.createCollection({
      name: "Kumkumadi Collection",
      description: "Premium Ayurvedic skincare with saffron",
      slug: "kumkumadi",
      imageUrl: "https://images.unsplash.com/photo-1617500603321-cae6be1442f1",
      featured: true
    });
    
    const amrrepa = await this.createCollection({
      name: "Amrrepa Collection",
      description: "Holistic healing and rejuvenation",
      slug: "amrrepa",
      imageUrl: "https://images.unsplash.com/photo-1619451683295-87ea57cbdabb",
      featured: true
    });
    
    const ujjasara = await this.createCollection({
      name: "Ujjasara Collection",
      description: "Advanced Ayurvedic haircare",
      slug: "ujjasara",
      imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be",
      featured: true
    });
    
    const bestsellers = await this.createCollection({
      name: "Bestsellers",
      description: "Our most popular products",
      slug: "bestsellers",
      imageUrl: "https://images.unsplash.com/photo-1619451683295-87ea57cbdabb",
      featured: true
    });

    // Add demo products
    const product1 = await this.createProduct({
      sku: "KMS-001",
      name: "Kumkumadi Youth-Clarifying Mask-Scrub",
      description: "A luxurious mask-scrub that gently cleanses and clarifies skin while enhancing radiance. This 2-in-1 formula is infused with kumkumadi oil, saffron, and natural exfoliants to reveal smoother, brighter skin.",
      shortDescription: "Gently Cleanses And Clears Skin, While Enhancing Radiance",
      price: 3695.00,
      images: ["https://images.unsplash.com/photo-1608571423539-e951a99b1e8a"],
      imageUrl: "https://images.unsplash.com/photo-1608571423539-e951a99b1e8a",
      stock: 100,
      rating: 4.5,
      totalReviews: 19,
      slug: "kumkumadi-youth-clarifying-mask-scrub",
      categoryId: skinCare._id as string,
      featured: true as boolean,
      bestseller: true,
      isNew: true
    });
    
    const product2 = await this.createProduct({
      sku: "KSS-001",
      name: "Kumkumadi Youth-Illuminating Silky Serum",
      description: "An innovative serum formulated with traditional Ayurvedic ingredients for skin brightening and illumination. This silky serum is the botanical alternative to Vitamin C, delivering intense hydration and radiance.",
      shortDescription: "The Botanical Alternative To Vitamin C",
      price: 2695.00,
      images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be"],
      imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be",
      stock: 150,
      rating: 5.0,
      totalReviews: 3,
      slug: "kumkumadi-youth-illuminating-silky-serum",
      categoryId: skinCare._id as string,
      featured: true as boolean,
      bestseller: false,
      isNew: true
    });
    
    const product3 = await this.createProduct({
      sku: "KDS-001",
      name: "Kumkumadi Glow Discovery Set",
      description: "Experience the magic of Kumkumadi with this curated set of glow-enhancing products. Powered with saffron, this trio delivers transformative results for radiant, youthful skin.",
      shortDescription: "Glow Trio | Powered With Saffron",
      price: 4250.00,
      images: ["https://images.unsplash.com/photo-1619451683295-87ea57cbdabb"],
      imageUrl: "https://images.unsplash.com/photo-1619451683295-87ea57cbdabb",
      stock: 75,
      rating: 5.0,
      totalReviews: 7,
      slug: "kumkumadi-glow-discovery-set",
      categoryId: skinCare._id as string,
      featured: true as boolean,
      bestseller: true,
      isNew: false
    });
    
    const product4 = await this.createProduct({
      sku: "KFO-001",
      name: "Kumkumadi Brightening Face Oil",
      description: "A luxurious Ayurvedic facial oil infused with saffron and 12 precious herbs to brighten skin, reduce dark spots, and promote a youthful glow.",
      shortDescription: "Luxurious Ayurvedic facial oil for brightening",
      price: 1995.00,
      images: ["https://images.unsplash.com/photo-1629198735566-e36c0bd9ad76"],
      imageUrl: "https://images.unsplash.com/photo-1629198735566-e36c0bd9ad76",
      stock: 200,
      rating: 5.0,
      totalReviews: 156,
      slug: "kumkumadi-brightening-face-oil",
      categoryId: skinCare._id as string,
      featured: true as boolean,
      bestseller: true,
      isNew: false
    });
    
    const product5 = await this.createProduct({
      sku: "BHO-001",
      name: "Bringadi Intensive Hair Treatment Oil",
      description: "A potent hair treatment oil formulated with Indigo, Eclipta Alba, and Gooseberry to reduce hair fall, strengthen roots, and promote healthy growth.",
      shortDescription: "Reduces hair fall and promotes growth",
      price: 1695.00,
      images: ["https://images.unsplash.com/photo-1631729371254-42c2892f0e6e"],
      imageUrl: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e",
      stock: 180,
      rating: 4.5,
      totalReviews: 124,
      slug: "bringadi-intensive-hair-treatment-oil",
      categoryId: hairCare._id as string,
      featured: false as boolean,
      bestseller: true,
      isNew: false
    });
    
    const product6 = await this.createProduct({
      sku: "RFC-001",
      name: "Rose Jasmine Face Cleanser",
      description: "A gentle, aromatic cleanser that effectively removes impurities while preserving skin's natural moisture. Infused with rose and jasmine for a sensorial experience.",
      shortDescription: "Gentle cleansing with aromatic benefits",
      price: 1250.00,
      images: ["https://images.unsplash.com/photo-1566958769312-82cef41d19ef"],
      imageUrl: "https://images.unsplash.com/photo-1566958769312-82cef41d19ef",
      stock: 150,
      rating: 5.0,
      totalReviews: 89,
      slug: "rose-jasmine-face-cleanser",
      categoryId: skinCare._id as string,
      featured: false as boolean,
      bestseller: true,
      isNew: false
    });
    
    const product7 = await this.createProduct({
      sku: "PRW-001",
      name: "Pure Rose Water",
      description: "Steam-distilled pure rose water that tones, hydrates, and refreshes skin. Can be used as a facial toner or added to face packs for enhanced benefits.",
      shortDescription: "Pure, steam-distilled rose hydrosol",
      price: 795.00,
      images: ["https://images.unsplash.com/photo-1601055903647-ddf1ee9701b1"],
      imageUrl: "https://images.unsplash.com/photo-1601055903647-ddf1ee9701b1",
      stock: 250,
      rating: 4.5,
      totalReviews: 173,
      slug: "pure-rose-water",
      categoryId: skinCare._id as string,
      featured: false as boolean,
      bestseller: true,
      isNew: false
    });

    // Add products to collections
    await this.addProductToCollection({
      productId: product1._id as string,
      collectionId: kumkumadi._id as string
    });
    
    await this.addProductToCollection({
      productId: product2._id as string,
      collectionId: kumkumadi._id as string
    });
    
    await this.addProductToCollection({
      productId: product3._id as string,
      collectionId: kumkumadi._id as string
    });
    
    await this.addProductToCollection({
      productId: product4._id as string,
      collectionId: kumkumadi._id as string
    });
    
    await this.addProductToCollection({
      productId: product5._id as string,
      collectionId: ujjasara._id as string
    });
    
    await this.addProductToCollection({
      productId: product6._id as string,
      collectionId: amrrepa._id as string
    });
    
    await this.addProductToCollection({
      productId: product7._id as string,
      collectionId: amrrepa._id as string
    });
    
    await this.addProductToCollection({
      productId: product4._id as string,
      collectionId: bestsellers._id as string
    });
    
    await this.addProductToCollection({
      productId: product5._id as string,
      collectionId: bestsellers._id as string
    });
    
    await this.addProductToCollection({
      productId: product6._id as string,
      collectionId: bestsellers._id as string
    });
    
    await this.addProductToCollection({
      productId: product7._id as string,
      collectionId: bestsellers._id as string
    });

    // Add testimonials
    await this.createTestimonial({
      name: "Priya S.",
      rating: 5,
      content: "The Kumkumadi face oil has transformed my skin. I've been using it for 3 months now and my skin looks more radiant and even-toned. The natural fragrance is also divine!",
      featured: true
    });
    
    await this.createTestimonial({
      name: "Rahul M.",
      rating: 5,
      content: "I was skeptical about Ayurvedic hair care but Bringadi oil has proven me wrong. My hair fall has reduced significantly and my scalp feels healthier. The best part is that it's all natural!",
      featured: true
    });
    
    await this.createTestimonial({
      name: "Anita K.",
      rating: 4,
      content: "The Rose Jasmine face cleanser is gentle yet effective. It removes all my makeup without drying out my skin. The scent is heavenly and leaves my face feeling fresh and clean.",
      featured: true
    });

    // Add banner
    await this.createBanner({
      title: "DISCOVER NEXT GENERATION AYURVEDIC SKINCARE",
      subtitle: "CHOOSE ANY COMPLIMENTARY PRODUCTS OF YOUR CHOICE WORTH UPTO ₹3990",
      desktopImageUrl: "https://images.unsplash.com/photo-1617500603321-cae6be1442f1",
      mobileImageUrl: "https://images.unsplash.com/photo-1617500603321-cae6be1442f1",
      alt: "Ayurvedic Skincare",
      linkUrl: "/collections/all",
      enabled: true,
      position: 1
    });

    // Add admin user
    await this.createUser({
      name: "Admin User",
      email: "admin@kamaayurveda.com",
      password: "admin123", // In real app, this would be hashed
      address: undefined,
      city: undefined,
      state: undefined,
      zipCode: undefined,
      phone: undefined
    });
    
    // Then separately set the user as admin after creation
    const adminUser = await this.getUserByEmail("admin@kamaayurveda.com");
    if (adminUser) {
      await this.updateUser(adminUser.id, { isAdmin: true } as any);
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const user = this.users.get(id);
    return user ? ensureId(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(user => user.email === email);
    return user ? ensureId(user) : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId = (parseInt(this.userId) + 1).toString();
    const newUser: User = { 
      ...user, 
      id: id,
      isAdmin: (user as any).isAdmin ?? false, // Type assertion to handle isAdmin property
      createdAt: new Date(),
      // Ensure all nullable fields are set properly
      address: user.address || undefined,
      city: user.city || undefined,
      state: user.state || undefined,
      zipCode: user.zipCode || undefined,
      phone: user.phone || undefined
    };
    this.users.set(id, newUser);
    return ensureId(newUser);
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return ensureId(updatedUser);
  }

  // Product operations
  async getProducts(options: { limit?: number, offset?: number, categoryId?: string, collectionId?: string } = {}): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (options.categoryId) {
      products = products.filter(product => product.categoryId === options.categoryId);
    }
    
    if (options.collectionId) {
      const collectionProducts = await this.getCollectionProducts(options.collectionId);
      const getProductId = (product: any) => product.id || product._id;
      const collectionProductIds = collectionProducts.map(getProductId);
      products = products.filter(product => collectionProductIds.includes(getProductId(product)));
    }
    
    const offset = options.offset || 0;
    const limit = options.limit || products.length;
    
    return products.slice(offset, offset + limit).map(ensureId);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const product = this.products.get(id);
    return product ? ensureId(product) : undefined;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const product = Array.from(this.products.values()).find(product => product.slug === slug);
    return product ? ensureId(product) : undefined;
  }

  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    const featuredProducts = Array.from(this.products.values())
      .filter(product => product.featured);
    
    return (limit ? featuredProducts.slice(0, limit) : featuredProducts).map(ensureId);
  }

  async getBestsellerProducts(limit?: number): Promise<Product[]> {
    const bestsellerProducts = Array.from(this.products.values())
      .filter(product => product.bestseller);
    
    return (limit ? bestsellerProducts.slice(0, limit) : bestsellerProducts).map(ensureId);
  }

  async getNewProducts(limit?: number): Promise<Product[]> {
    const newProducts = Array.from(this.products.values())
      .filter(product => product.isNew);
    
    return (limit ? newProducts.slice(0, limit) : newProducts).map(ensureId);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId = (parseInt(this.productId) + 1).toString();
    const newProduct: Product = {
      ...product,
      _id: id,
      createdAt: new Date(),
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images,
      slug: product.slug,
      categoryId: product.categoryId,
      stock: product.stock || 0,
      rating: product.rating || 0,
      totalReviews: product.totalReviews || 0,
      shortDescription: product.shortDescription ?? undefined,
      discountedPrice: product.discountedPrice ?? undefined,
      featured: product.featured ?? undefined,
      bestseller: product.bestseller ?? undefined,
      isNew: product.isNew ?? undefined
    };
    this.products.set(id, newProduct);
    return ensureId(newProduct);
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(category => category.slug === slug);
  }

  async getFeaturedCategories(limit?: number): Promise<Category[]> {
    const featuredCategories = Array.from(this.categories.values())
      .filter(category => category.featured);
    
    return limit ? featuredCategories.slice(0, limit) : featuredCategories;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId = (parseInt(this.categoryId) + 1).toString();
    const newCategory: Category = { 
      ...category, 
      _id: id,
      description: category.description ?? undefined,
      imageUrl: category.imageUrl ?? undefined,
      featured: category.featured ?? undefined
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: string, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Collection operations
  async getCollections(): Promise<Collection[]> {
    return Array.from(this.collections.values());
  }

  async getCollectionById(id: string): Promise<Collection | undefined> {
    return this.collections.get(id);
  }

  async getCollectionBySlug(slug: string): Promise<Collection | undefined> {
    return Array.from(this.collections.values()).find(collection => collection.slug === slug);
  }

  async getFeaturedCollections(limit?: number): Promise<Collection[]> {
    const featuredCollections = Array.from(this.collections.values())
      .filter(collection => collection.featured);
    
    return limit ? featuredCollections.slice(0, limit) : featuredCollections;
  }

  async createCollection(collection: InsertCollection): Promise<Collection> {
    const id = (parseInt(this.collectionId) + 1).toString();
this.collectionId = id;
    const newCollection: Collection = { 
      ...collection, 
      _id: id,
      description: collection.description || undefined,
      imageUrl: collection.imageUrl || undefined,
      featured: typeof collection.featured === "boolean" ? collection.featured : undefined
    };
    this.collections.set(id, newCollection);
    return newCollection;
  }

  async updateCollection(id: string, collectionData: Partial<InsertCollection>): Promise<Collection | undefined> {
    const collection = this.collections.get(id);
    if (!collection) return undefined;
    
    const updatedCollection = { ...collection, ...collectionData };
    this.collections.set(id, updatedCollection);
    return updatedCollection;
  }

  async deleteCollection(id: string): Promise<boolean> {
    return this.collections.delete(id);
  }

  // Product-Collection mapping
  async addProductToCollection(productCollection: InsertProductCollection): Promise<ProductCollection> {
    const id = (parseInt(this.productCollectionId) + 1).toString();
this.productCollectionId = id;
    const newProductCollection: ProductCollection = { ...productCollection, id } as ProductCollection;
    this.productCollections.set(id, newProductCollection);
    return newProductCollection;
  }

  async removeProductFromCollection(productId: string, collectionId: string): Promise<boolean> {
    const entry = Array.from(this.productCollections.entries())
      .find(([_, pc]) => pc.productId === productId && pc.collectionId === collectionId);
    
    if (!entry) return false;
    return this.productCollections.delete(entry[0]);
  }

  async getProductCollections(productId: string): Promise<Collection[]> {
    const collectionIds = Array.from(this.productCollections.values())
      .filter(pc => pc.productId === productId)
      .map(pc => pc.collectionId as string);
    
    return Array.from(this.collections.values())
      .filter(collection => collectionIds.includes(collection._id as string));
  }

  async getCollectionProducts(collectionId: string): Promise<Product[]> {
    const productIds = Array.from(this.productCollections.values())
      .filter(pc => pc.collectionId === collectionId)
      .map(pc => pc.productId as string);
    
    const getProductId = (product: any) => product.id || product._id;
    return Array.from(this.products.values())
      .filter(product => productIds.includes(getProductId(product)));
  }

  // Order operations
  async getOrders(userId?: string, options?: { limit?: number, page?: number }): Promise<Order[]> {
    let orders = Array.from(this.orders.values());
    
    if (userId) {
      orders = orders.filter(order => order.userId === userId);
    }
    
    // Basic pagination for in-memory storage
    if (options && options.limit && options.page) {
      const start = (options.page - 1) * options.limit;
      const end = start + options.limit;
      orders = orders.slice(start, end);
    }
    
    return orders;
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = (parseInt(this.orderId) + 1).toString();
this.orderId = id;
    const newOrder: Order = {
      ...order,
      id: id,
      createdAt: new Date(),
      // Make sure status is always set
      status: order.status ?? 'pending'
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order item operations
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = (parseInt(this.orderItemId) + 1).toString();
this.orderItemId = id;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  // Review operations
  async getProductReviews(productId: string): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.productId === productId);
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.userId === userId);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = (parseInt(this.reviewId) + 1).toString();
this.reviewId = id;
    const newReview: Review = {
      ...review,
      id: id,
      createdAt: new Date()
    };
    this.reviews.set(id, newReview);
    
    // Update product rating
    const product = this.products.get(review.productId);
    if (product) {
      const reviews = await this.getProductReviews(review.productId);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / reviews.length;
      
      const getProductId = (product: any) => product.id || product._id;
      this.updateProduct(getProductId(product), {
        rating: avgRating,
        totalReviews: reviews.length
      });
    }
    
    return newReview;
  }

  async updateReview(id: string, reviewData: Partial<InsertReview>): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    
    const updatedReview = { ...review, ...reviewData };
    this.reviews.set(id, updatedReview);
    
    // Update product rating
    if (reviewData.rating) {
      const product = this.products.get(review.productId);
      if (product) {
        const reviews = await this.getProductReviews(review.productId);
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRating / reviews.length;
        
        const getProductId = (product: any) => product.id || product._id;
        this.updateProduct(getProductId(product), {
          rating: avgRating
        });
      }
    }
    
    return updatedReview;
  }

  async deleteReview(id: string): Promise<boolean> {
    const review = this.reviews.get(id);
    if (!review) return false;
    
    const result = this.reviews.delete(id);
    
    // Update product rating
    if (result) {
      const product = this.products.get(review.productId);
      if (product) {
        const reviews = await this.getProductReviews(review.productId);
        
        if (reviews.length === 0) {
          const getProductId = (product: any) => product.id || product._id;
          this.updateProduct(getProductId(product), {
            rating: 0,
            totalReviews: 0
          });
        } else {
          const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = totalRating / reviews.length;
          
          const getProductId = (product: any) => product.id || product._id;
          this.updateProduct(getProductId(product), {
            rating: avgRating,
            totalReviews: reviews.length
          });
        }
      }
    }
    
    return result;
  }

  // Testimonial operations
  async getTestimonials(limit?: number): Promise<Testimonial[]> {
    const testimonials = Array.from(this.testimonials.values());
    return limit ? testimonials.slice(0, limit) : testimonials;
  }

  async getFeaturedTestimonials(limit?: number): Promise<Testimonial[]> {
    const featuredTestimonials = Array.from(this.testimonials.values())
      .filter(testimonial => testimonial.featured);
    
    return limit ? featuredTestimonials.slice(0, limit) : featuredTestimonials;
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const id = (parseInt(this.testimonialId) + 1).toString();
this.testimonialId = id;
    const newTestimonial: Testimonial = { 
      ...testimonial, 
      id: id,
      createdAt: new Date(),
      featured: testimonial.featured ?? false
    };
    this.testimonials.set(id, newTestimonial);
    return newTestimonial;
  }

  // Cart operations
  async getCart(userId?: string, sessionId?: string): Promise<Cart | undefined> {
    if (userId) {
      return Array.from(this.carts.values())
        .find(cart => cart.userId === userId);
    }
    
    if (sessionId) {
      return Array.from(this.carts.values())
        .find(cart => cart.sessionId === sessionId);
    }
    
    return undefined;
  }

  async createCart(cart: InsertCart): Promise<Cart> {
    const id = (parseInt(this.cartId) + 1).toString();
this.cartId = id;
    const newCart: Cart = {
      ...cart,
      id: id,
      createdAt: new Date(),
      // Ensure all nullable fields are set properly
      userId: cart.userId || undefined,
      sessionId: cart.sessionId || undefined
    };
    this.carts.set(id, newCart);
    return newCart;
  }

  // Cart item operations
  async getCartItems(cartId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values())
      .filter(item => item.cartId === cartId);
  }

  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existingItem = Array.from(this.cartItems.values())
      .find(item => item.cartId === cartItem.cartId && item.productId === cartItem.productId);
    
    if (existingItem) {
      return this.updateCartItemQuantity(existingItem.id as string, Number(existingItem.quantity) + Number(cartItem.quantity)) as Promise<CartItem>;
    }
    
    const id = (parseInt(this.cartItemId) + 1).toString();
this.cartItemId = id;
    const newCartItem: CartItem = { ...cartItem, id };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }

  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    if (quantity <= 0) {
      this.cartItems.delete(id);
      return undefined;
    }
    
    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }

  async removeCartItem(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(cartId: string): Promise<boolean> {
    const itemIds = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.cartId === cartId)
      .map(([id, _]) => id);
    
    for (const id of itemIds) {
      this.cartItems.delete(id);
    }
    
    return true;
  }

  // Banner operations
  async getBanners(enabled?: boolean): Promise<Banner[]> {
    let banners = Array.from(this.banners.values());
    if (enabled !== undefined) {
      banners = banners.filter(b => b.enabled === enabled);
    }
    return banners.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  async createBanner(banner: InsertBanner): Promise<Banner> {
    const id = this.bannerId = (parseInt(this.bannerId) + 1).toString();
    const newBanner: Banner = ensureId({
      id: id,
      title: banner.title,
      subtitle: banner.subtitle ?? undefined,
      desktopImageUrl: banner.desktopImageUrl,
      mobileImageUrl: banner.mobileImageUrl,
      alt: banner.alt,
      linkUrl: banner.linkUrl ?? undefined,
      enabled: banner.enabled,
      position: banner.position
    });
    this.banners.set(id, newBanner);
    return newBanner;
  }

  async updateBanner(id: string, bannerData: Partial<InsertBanner>): Promise<Banner> {
    const banner = this.banners.get(id);
    if (!banner) throw new Error('updateBanner returned undefined');
    const updatedBanner = { ...banner, ...bannerData } as Banner;
    this.banners.set(id, updatedBanner);
    return updatedBanner;
  }

  async deleteBanner(id: string): Promise<boolean> {
    return this.banners.delete(id);
  }
}

// Import the MongoDB storage implementation
import { MongoDBStorage } from './storage/MongoDBStorage';
import mongoose from 'mongoose';

// Create a FallbackStorage that tries MongoDB first, then falls back to memory storage
class FallbackStorage implements IStorage {
  private mongoStorage: MongoDBStorage;
  private memStorage: MemStorage;
  private useMongoStorage: boolean = false;
  
  constructor() {
    this.mongoStorage = new MongoDBStorage();
    this.memStorage = new MemStorage();
  
    // Check MongoDB connection status
    this.useMongoStorage = mongoose.connection.readyState === 1; // 1 = connected
  
    // Log which storage we're using
    if (!this.useMongoStorage) {
      console.warn('MongoDB is not connected. Using memory storage fallback.');
    }

    // Listen for MongoDB connection changes
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected, switching to MongoDB storage');
      this.useMongoStorage = true;
    });

    mongoose.connection.on('disconnected', () => {
      console.error('MongoDB disconnected. Switching to memory storage fallback.');
      this.useMongoStorage = false;
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error. Switching to memory storage fallback:', err);
      this.useMongoStorage = false;
    });
  }
  
  // Helper method to route to the appropriate storage implementation
  private getStorage(): IStorage {
    return this.useMongoStorage ? this.mongoStorage : this.memStorage;
  }
  
  // Generic method wrapper to handle storage failures
  private async withFallback<T>(operation: string, method: () => Promise<T>): Promise<T> {
    try {
      return await method();
    } catch (error) {
      console.error(`Error in ${operation}:`, error);
      if (this.useMongoStorage) {
        console.error(`MongoDB operation failed for ${operation}:`, error);
        console.warn(`Switching to memory storage for ${operation}`);
        this.useMongoStorage = false;
        try {
          return await method();
        } catch (memError) {
          console.error(`Memory storage operation failed for ${operation}:`, memError);
          throw new Error(`Storage operation failed for ${operation}`);
        }
      }
      throw new Error(`Storage operation failed for ${operation}`);
    }
  }
  
  // Define all IStorage methods to route to the appropriate implementation
  async getUser(id: string): Promise<User | undefined> {
    return this.withFallback('getUser', () => this.getStorage().getUser(id));
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.withFallback('getUserByEmail', () => this.getStorage().getUserByEmail(email));
  }
  
  async createUser(user: InsertUser): Promise<User> {
    return this.withFallback('createUser', () => this.getStorage().createUser(user));
  }
  
  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    return this.withFallback('updateUser', () => this.getStorage().updateUser(id, userData));
  }
  
  async getProducts(options: { limit?: number, offset?: number, categoryId?: string, collectionId?: string } = {}): Promise<Product[]> {
    return this.withFallback('getProducts', () => this.getStorage().getProducts(options));
  }
  
  async getProductById(id: string): Promise<Product | undefined> {
    return this.withFallback('getProductById', () => this.getStorage().getProductById(id));
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return this.withFallback('getProductBySlug', () => this.getStorage().getProductBySlug(slug));
  }
  
  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    return this.withFallback('getFeaturedProducts', () => this.getStorage().getFeaturedProducts(limit));
  }
  
  async getBestsellerProducts(limit?: number): Promise<Product[]> {
    return this.withFallback('getBestsellerProducts', () => this.getStorage().getBestsellerProducts(limit));
  }
  
  async getNewProducts(limit?: number): Promise<Product[]> {
    return this.withFallback('getNewProducts', () => this.getStorage().getNewProducts(limit));
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    return this.withFallback('createProduct', () => this.getStorage().createProduct(product));
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    return this.withFallback('updateProduct', () => this.getStorage().updateProduct(id, productData));
  }
  
  async deleteProduct(id: string): Promise<boolean> {
    return this.withFallback('deleteProduct', () => this.getStorage().deleteProduct(id));
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return this.withFallback('getCategories', () => this.getStorage().getCategories());
  }
  
  async getCategoryById(id: string): Promise<Category | undefined> {
    return this.withFallback('getCategoryById', () => this.getStorage().getCategoryById(id));
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return this.withFallback('getCategoryBySlug', () => this.getStorage().getCategoryBySlug(slug));
  }
  
  async getFeaturedCategories(limit?: number): Promise<Category[]> {
    return this.withFallback('getFeaturedCategories', () => this.getStorage().getFeaturedCategories(limit));
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    return this.withFallback('createCategory', () => this.getStorage().createCategory(category));
  }
  
  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    return this.withFallback('updateCategory', () => this.getStorage().updateCategory(id, category));
  }
  
  async deleteCategory(id: string): Promise<boolean> {
    return this.withFallback('deleteCategory', () => this.getStorage().deleteCategory(id));
  }
  
  async getCollections(): Promise<Collection[]> {
    return this.withFallback('getCollections', () => this.getStorage().getCollections());
  }
  
  async getCollectionById(id: string): Promise<Collection | undefined> {
    return this.withFallback('getCollectionById', () => this.getStorage().getCollectionById(id));
  }
  
  async getCollectionBySlug(slug: string): Promise<Collection | undefined> {
    return this.withFallback('getCollectionBySlug', () => this.getStorage().getCollectionBySlug(slug));
  }
  
  async getFeaturedCollections(limit?: number): Promise<Collection[]> {
    return this.withFallback('getFeaturedCollections', () => this.getStorage().getFeaturedCollections(limit));
  }
  
  async createCollection(collection: InsertCollection): Promise<Collection> {
    return this.withFallback('createCollection', () => this.getStorage().createCollection(collection));
  }
  
  async updateCollection(id: string, collection: Partial<InsertCollection>): Promise<Collection | undefined> {
    return this.withFallback('updateCollection', () => this.getStorage().updateCollection(id, collection));
  }
  
  async deleteCollection(id: string): Promise<boolean> {
    return this.withFallback('deleteCollection', () => this.getStorage().deleteCollection(id));
  }
  
  async addProductToCollection(productCollection: InsertProductCollection): Promise<ProductCollection> {
    return this.withFallback('addProductToCollection', () => this.getStorage().addProductToCollection(productCollection));
  }
  
  async removeProductFromCollection(productId: string, collectionId: string): Promise<boolean> {
    return this.withFallback('removeProductFromCollection', () => this.getStorage().removeProductFromCollection(productId, collectionId));
  }
  
  async getProductCollections(productId: string): Promise<Collection[]> {
    return this.withFallback('getProductCollections', () => this.getStorage().getProductCollections(productId));
  }
  
  async getCollectionProducts(collectionId: string): Promise<Product[]> {
    return this.withFallback('getCollectionProducts', () => this.getStorage().getCollectionProducts(collectionId));
  }
  
  async getOrders(userId?: string, options?: { limit?: number, page?: number }): Promise<Order[]> {
    return this.withFallback('getOrders', () => this.getStorage().getOrders(userId, options));
  }
  
  async getOrderById(id: string): Promise<Order | undefined> {
    return this.withFallback('getOrderById', () => this.getStorage().getOrderById(id));
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    return this.withFallback('createOrder', () => this.getStorage().createOrder(order));
  }
  
  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    return this.withFallback('updateOrderStatus', () => this.getStorage().updateOrderStatus(id, status));
  }
  
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return this.withFallback('getOrderItems', () => this.getStorage().getOrderItems(orderId));
  }
  
  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    return this.withFallback('addOrderItem', () => this.getStorage().addOrderItem(orderItem));
  }
  
  async getProductReviews(productId: string): Promise<Review[]> {
    return this.withFallback('getProductReviews', () => this.getStorage().getProductReviews(productId));
  }
  
  async getUserReviews(userId: string): Promise<Review[]> {
    return this.withFallback('getUserReviews', () => this.getStorage().getUserReviews(userId));
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    return this.withFallback('createReview', () => this.getStorage().createReview(review));
  }
  
  async updateReview(id: string, review: Partial<InsertReview>): Promise<Review | undefined> {
    return this.withFallback('updateReview', () => this.getStorage().updateReview(id, review));
  }
  
  async deleteReview(id: string): Promise<boolean> {
    return this.withFallback('deleteReview', () => this.getStorage().deleteReview(id));
  }
  
  async getTestimonials(limit?: number): Promise<Testimonial[]> {
    return this.withFallback('getTestimonials', () => this.getStorage().getTestimonials(limit));
  }
  
  async getFeaturedTestimonials(limit?: number): Promise<Testimonial[]> {
    return this.withFallback('getFeaturedTestimonials', () => this.getStorage().getFeaturedTestimonials(limit));
  }
  
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    return this.withFallback('createTestimonial', () => this.getStorage().createTestimonial(testimonial));
  }
  
  async getCartItems(cartId: string): Promise<CartItem[]> {
    return this.withFallback('getCartItems', () => this.getStorage().getCartItems(cartId));
  }
  
  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    return this.withFallback('addCartItem', () => this.getStorage().addCartItem(cartItem));
  }
  
  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined> {
    return this.withFallback('updateCartItemQuantity', () => this.getStorage().updateCartItemQuantity(id, quantity));
  }
  
  async removeCartItem(id: string): Promise<boolean> {
    return this.withFallback('removeCartItem', () => this.getStorage().removeCartItem(id));
  }
  
  async clearCart(cartId: string): Promise<boolean> {
    return this.withFallback('clearCart', () => {
      const result = this.getStorage().clearCart(cartId);
      if (typeof result === 'undefined') throw new Error('clearCart returned undefined');
      return result;
    });
  }
  
  async getCart(userId?: string, sessionId?: string): Promise<Cart | undefined> {
    return this.withFallback('getCart', () => this.getStorage().getCart(userId, sessionId));
  }
  
  async createCart(cart: InsertCart): Promise<Cart> {
    return this.withFallback('createCart', () => this.getStorage().createCart(cart));
  }
  
  async getBanners(enabled?: boolean): Promise<Banner[]> {
    return this.withFallback('getBanners', () => this.getStorage().getBanners(enabled));
  }
  
  async createBanner(banner: InsertBanner): Promise<Banner> {
    return this.withFallback('createBanner', () => {
      const result = this.getStorage().createBanner(banner);
      if (typeof result === 'undefined') throw new Error('createBanner returned undefined');
      return result;
    });
  }
  
  async updateBanner(id: string, banner: Partial<InsertBanner>): Promise<Banner> {
    return this.withFallback('updateBanner', () => {
      const result = this.getStorage().updateBanner(id, banner);
      if (typeof result === 'undefined') throw new Error('updateBanner returned undefined');
      return result;
    });
  }
  
  async deleteBanner(id: string): Promise<boolean> {
    return this.withFallback('deleteBanner', () => {
      const result = this.getStorage().deleteBanner(id);
      if (typeof result === 'undefined') throw new Error('deleteBanner returned undefined');
      return result;
    });

  }
}

// Create and export the storage instance
export const storage = new FallbackStorage();
