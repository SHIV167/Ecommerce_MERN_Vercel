// @ts-nocheck
import { log } from './vite';
import { storage } from './storage';
import { type Category, type Collection } from '@shared/schema';
import GiftCardTemplate from './models/GiftCardTemplate';

// Initialize demo data for the MongoDB database
export async function initDemoData() {
  try {
    console.log("Initializing demo data...");
    // Seed gift card templates if none exist
    const templateCount = await GiftCardTemplate.countDocuments();
    if (templateCount === 0) {
      const now = new Date();
      await GiftCardTemplate.create([
        { initialAmount: 500, expiryDate: new Date(now.getFullYear() + 1, now.getMonth()), isActive: true },
        { initialAmount: 1000, expiryDate: new Date(now.getFullYear() + 1, now.getMonth()), isActive: true },
        { initialAmount: 2500, expiryDate: new Date(now.getFullYear() + 1, now.getMonth()), isActive: true },
      ]);
      console.log("Seeded demo gift card templates");
    }
    // Skip if demo data already initialized
    const existingProducts = await storage.getProducts({ limit: 1 });
    if (existingProducts.length > 0) {
      console.log("Demo data already exists. Skipping initialization.");
      return;
    }
    // Fetch or create demo categories
    let herbCategory = await storage.getCategoryBySlug("herbs-supplements");
    if (!herbCategory) herbCategory = await storage.createCategory({
      name: "Herbs & Supplements", slug: "herbs-supplements", description: "Natural herbs and supplements for holistic wellness", imageUrl: "/images/categories/herbs.jpg", featured: true
    });
    let skinCategory = await storage.getCategoryBySlug("skin-care");
    if (!skinCategory) skinCategory = await storage.createCategory({
      name: "Skin Care", slug: "skin-care", description: "Ayurvedic skincare formulations for radiant skin", imageUrl: "/images/categories/skincare.jpg", featured: true
    });
    let hairCategory = await storage.getCategoryBySlug("hair-care");
    if (!hairCategory) hairCategory = await storage.createCategory({
      name: "Hair Care", slug: "hair-care", description: "Natural hair care products based on Ayurvedic principles", imageUrl: "/images/categories/haircare.jpg", featured: true
    });
    let bodyCategory = await storage.getCategoryBySlug("body-care");
    if (!bodyCategory) bodyCategory = await storage.createCategory({
      name: "Body Care", slug: "body-care", description: "Nourishing body care products with Ayurvedic ingredients", imageUrl: "/images/categories/bodycare.jpg", featured: true
    });
    
    console.log("Created categories successfully");
    
    // Fetch or create collections
    let summerCollection = await storage.getCollectionBySlug("summer-essentials");
    if (!summerCollection) summerCollection = await storage.createCollection({
      name: "Summer Essentials", slug: "summer-essentials", description: "Beat the heat with these cooling and calming Ayurvedic products", imageUrl: "/images/collections/summer.jpg", featured: true
    });
    let bestsellersCollection = await storage.getCollectionBySlug("best-sellers");
    if (!bestsellersCollection) bestsellersCollection = await storage.createCollection({
      name: "Best Sellers", slug: "best-sellers", description: "Our most popular Ayurvedic products loved by our customers", imageUrl: "/images/collections/bestsellers.jpg", featured: true
    });
    let giftsCollection = await storage.getCollectionBySlug("gift-sets");
    if (!giftsCollection) giftsCollection = await storage.createCollection({
      name: "Gift Sets", slug: "gift-sets", description: "Perfect Ayurvedic gift sets for your loved ones", imageUrl: "/images/collections/gifts.jpg", featured: true
    });
    
    console.log("Created collections successfully");
    
    // Create products and add to collections
    // Sample products
    const products = [
      {
        name: "Ashwagandha Root Powder",
        slug: "ashwagandha-root-powder",
        description: "Organic Ashwagandha root powder for stress relief and improved vitality.",
        price: 24.99,
        discountedPrice: 19.99,
        categoryId: herbCategory.id,
        sku: "HERB-001",
        stock: 100,
        imageUrl: "/images/products/ashwagandha.jpg",
        featured: true,
        bestseller: true,
        isNew: false
      },
      {
        name: "Kumkumadi Brightening Face Oil",
        slug: "kumkumadi-brightening-oil",
        description: "Traditional Ayurvedic facial oil for brightening and rejuvenating skin.",
        price: 49.99,
        discountedPrice: null,
        categoryId: skinCategory.id,
        sku: "SKIN-001",
        stock: 50,
        imageUrl: "/images/products/kumkumadi.jpg",
        featured: true,
        bestseller: true,
        isNew: false
      },
      {
        name: "Bhringraj Hair Oil",
        slug: "bhringraj-hair-oil",
        description: "Nourishing hair oil to promote hair growth and prevent premature graying.",
        price: 34.99,
        discountedPrice: 29.99,
        categoryId: hairCategory.id,
        sku: "HAIR-001",
        stock: 75,
        imageUrl: "/images/products/bhringraj.jpg",
        featured: false,
        bestseller: true,
        isNew: false
      },
      {
        name: "Rose & Jasmine Body Oil",
        slug: "rose-jasmine-body-oil",
        description: "Luxurious body oil with the goodness of rose and jasmine for deep moisturization.",
        price: 39.99,
        discountedPrice: null,
        categoryId: bodyCategory.id,
        sku: "BODY-001",
        stock: 60,
        imageUrl: "/images/products/rosejasmine.jpg",
        featured: true,
        bestseller: false,
        isNew: true
      },
      {
        name: "Triphala Powder",
        slug: "triphala-powder",
        description: "Traditional Ayurvedic formula for digestive health and detoxification.",
        price: 19.99,
        discountedPrice: 17.99,
        categoryId: herbCategory.id,
        sku: "HERB-002",
        stock: 120,
        imageUrl: "/images/products/triphala.jpg",
        featured: false,
        bestseller: false,
        isNew: true
      },
      {
        name: "Aloe Vera Gel",
        slug: "aloe-vera-gel",
        description: "Pure aloe vera gel for soothing and hydrating skin.",
        price: 14.99,
        discountedPrice: null,
        categoryId: skinCategory.id,
        sku: "SKIN-002",
        stock: 90,
        imageUrl: "/images/products/aloevera.jpg",
        featured: false,
        bestseller: false,
        isNew: true
      },
      {
        name: "Herbal Bath Salts",
        slug: "herbal-bath-salts",
        description: "Detoxifying bath salts with Ayurvedic herbs for relaxation.",
        price: 29.99,
        discountedPrice: 24.99,
        categoryId: bodyCategory.id,
        sku: "BODY-002",
        stock: 40,
        imageUrl: "/images/products/bathsalts.jpg",
        featured: false,
        bestseller: true,
        isNew: false
      }
    ];
    
    // Create each product
    for (const productData of products) {
      const product = await storage.createProduct(productData);
      
      // Add products to relevant collections
      if (productData.featured) {
        await storage.addProductToCollection({
          productId: product.id,
          collectionId: bestsellersCollection.id
        });
      }
      
      if (productData.categoryId === skinCategory.id || productData.categoryId === bodyCategory.id) {
        await storage.addProductToCollection({
          productId: product.id,
          collectionId: summerCollection.id
        });
      }
    }
    
    console.log("Created products and added to collections successfully");
    
    // Create some testimonials
    const testimonials = [
      {
        name: "Priya S.",
        rating: 5,
        testimonial: "The Ashwagandha powder has been a game-changer for my stress levels and sleep quality. I feel more balanced and energetic throughout the day. Highly recommend!",
        featured: true,
        location: "Yoga Instructor"
      },
      {
        name: "Amit K.",
        rating: 5,
        testimonial: "I've been using the Kumkumadi face oil for a month now, and the difference in my skin is remarkable. My complexion is brighter, and the fine lines around my eyes are less visible.",
        featured: true,
        location: "IT Professional"
      },
      {
        name: "Sarah T.",
        rating: 4,
        testimonial: "The herbal bath salts are the perfect way to unwind after a long day. They smell amazing and leave my skin feeling soft and nourished.",
        featured: true,
        location: "Wellness Coach"
      }
    ];
    
    for (const testimonialData of testimonials) {
      await storage.createTestimonial(testimonialData);
    }
    
    console.log("Created testimonials successfully");
    
    // Create banners
    const banners = [
      {
        title: "Summer Ayurveda Sale",
        subtitle: "Up to 30% off on selected products",
        imageUrl: "/images/banners/summer-sale.jpg",
        buttonText: "Shop Now",
        buttonLink: "/collections/summer-essentials",
        active: true,
        order: 1
      },
      {
        title: "New Arrivals",
        subtitle: "Discover our latest Ayurvedic formulations",
        imageUrl: "/images/banners/new-arrivals.jpg",
        buttonText: "Explore",
        buttonLink: "/new-arrivals",
        active: true,
        order: 2
      }
    ];
    
    for (const bannerData of banners) {
      await storage.createBanner(bannerData);
    }
    
    console.log("Created banners successfully");
    
    // Create an admin user
    await storage.createUser({
      name: "Admin User",
      email: "admin@kamaayurveda.com",
      password: "admin123" // In a real app, this would be hashed
    });
    
    console.log("Created admin user successfully");
    
    // Create a regular user
    await storage.createUser({
      name: "John Doe",
      email: "john@example.com",
      password: "password123" // In a real app, this would be hashed
    });
    
    console.log("Created regular user successfully");
    console.log("Demo data initialization complete!");
    
  } catch (error) {
    console.error("Error initializing demo data:", error);
    throw error;
  }
}

// Create products using existing categories
async function createProductsWithExistingCategories(categories: Category[]) {
  try {
    log('Categories exist but no products. Creating products only...', 'mongodb');
    
    // Use existing categories
    const skinCare = categories.find((cat: Category) => cat.slug === 'skincare');
    const hairCare = categories.find((cat: Category) => cat.slug === 'haircare');
    
    if (!skinCare || !hairCare) {
      log('Required categories not found. Cannot create products.', 'mongodb');
      return;
    }
    
    // Get existing collections
    const collections = await storage.getCollections();
    const kumkumadi = collections.find(col => col.slug === 'kumkumadi');
    const amrrepa = collections.find(col => col.slug === 'amrrepa');
    const ujjasara = collections.find(col => col.slug === 'ujjasara');
    const bestsellers = collections.find(col => col.slug === 'bestsellers');
    
    if (!kumkumadi || !amrrepa || !ujjasara || !bestsellers) {
      log('Required collections not found.', 'mongodb');
      return;
    }
    
    // Create products
    // First, let's log the categories to see what's available
    log(`Debug - skinCare: ${JSON.stringify(skinCare)}`, 'mongodb');
    log(`Debug - hairCare: ${JSON.stringify(hairCare)}`, 'mongodb');
    
    await createProducts(
      skinCare,
      hairCare,
      kumkumadi,
      amrrepa,
      ujjasara,
      bestsellers
    );
    
    log('Products created successfully using existing categories and collections', 'mongodb');
  } catch (error) {
    log(`Error creating products with existing categories: ${error}`, 'mongodb');
  }
}

// Create complete data set from scratch
async function createCompleteData() {
  try {
    // Add demo categories
    const skinCare = await storage.createCategory({
      name: "Skincare",
      description: "Ayurvedic skin care products",
      slug: "skincare",
      imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?ixlib=rb-4.0.3",
      featured: true
    });
    
    const hairCare = await storage.createCategory({
      name: "Haircare",
      description: "Ayurvedic hair care products",
      slug: "haircare",
      imageUrl: "https://images.unsplash.com/photo-1574621100236-d25b64cfd647?ixlib=rb-4.0.3",
      featured: true
    });
    
    const bodycare = await storage.createCategory({
      name: "Bath & Body",
      description: "Ayurvedic body care products",
      slug: "bath-body",
      imageUrl: "https://images.unsplash.com/photo-1627467959547-215304e0e8cc?ixlib=rb-4.0.3",
      featured: true
    });
    
    const wellness = await storage.createCategory({
      name: "Wellness",
      description: "Ayurvedic wellness products",
      slug: "wellness",
      imageUrl: "https://images.unsplash.com/photo-1591084863828-30ebecaf2c82?ixlib=rb-4.0.3",
      featured: true
    });

    // Add demo collections
    const kumkumadi = await storage.createCollection({
      name: "Kumkumadi Collection",
      description: "Premium Ayurvedic skincare with saffron",
      slug: "kumkumadi",
      imageUrl: "https://images.unsplash.com/photo-1617500603321-cae6be1442f1",
      featured: true
    });
    
    const amrrepa = await storage.createCollection({
      name: "Amrrepa Collection",
      description: "Holistic healing and rejuvenation",
      slug: "amrrepa",
      imageUrl: "https://images.unsplash.com/photo-1619451683295-87ea57cbdabb",
      featured: true
    });
    
    const ujjasara = await storage.createCollection({
      name: "Ujjasara Collection",
      description: "Advanced Ayurvedic haircare",
      slug: "ujjasara",
      imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be",
      featured: true
    });
    
    const bestsellers = await storage.createCollection({
      name: "Bestsellers",
      description: "Our most popular products",
      slug: "bestsellers",
      imageUrl: "https://images.unsplash.com/photo-1619451683295-87ea57cbdabb",
      featured: true
    });

    // Create products
    // First, let's log the categories to see what's available
    log(`Debug - skinCare: ${JSON.stringify(skinCare)}`, 'mongodb');
    log(`Debug - hairCare: ${JSON.stringify(hairCare)}`, 'mongodb');
    
    // Use simple numeric IDs for consistency with the other function
    await createProducts(
      skinCare,
      hairCare,
      kumkumadi,
      amrrepa,
      ujjasara,
      bestsellers
    );
    
    // Add testimonials
    await createTestimonials();
    
    // Add banner
    await createBanner();
    
    // Add admin user
    await createAdminUser();
    
    log('Complete demo data created successfully', 'mongodb');
  } catch (error) {
    log(`Error creating complete data: ${error}`, 'mongodb');
  }
}

// Common function to create products
async function createProducts(
  skinCare: Category, 
  hairCare: Category, 
  kumkumadi: Collection, 
  amrrepa: Collection, 
  ujjasara: Collection, 
  bestsellers: Collection
) {
  try {
    // Add demo products
    const product1 = await storage.createProduct({
      name: "Kumkumadi Youth-Clarifying Mask-Scrub",
      description: "A luxurious mask-scrub that gently cleanses and clarifies skin while enhancing radiance. This 2-in-1 formula is infused with kumkumadi oil, saffron, and natural exfoliants to reveal smoother, brighter skin.",
      shortDescription: "Gently Cleanses And Clears Skin, While Enhancing Radiance",
      price: 3695.00,
      imageUrl: "https://images.unsplash.com/photo-1608571423539-e951a99b1e8a",
      stock: 100,
      rating: 4.5,
      totalReviews: 19,
      slug: "kumkumadi-youth-clarifying-mask-scrub",
      categoryId: skinCare.id,
      featured: true,
      bestseller: true,
      isNew: true
    });
    
    const product2 = await storage.createProduct({
      name: "Kumkumadi Youth-Illuminating Silky Serum",
      description: "An innovative serum formulated with traditional Ayurvedic ingredients for skin brightening and illumination. This silky serum is the botanical alternative to Vitamin C, delivering intense hydration and radiance.",
      shortDescription: "The Botanical Alternative To Vitamin C",
      price: 2695.00,
      imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be",
      stock: 150,
      rating: 5.0,
      totalReviews: 3,
      slug: "kumkumadi-youth-illuminating-silky-serum",
      categoryId: skinCare.id,
      featured: true,
      bestseller: false,
      isNew: true
    });
    
    const product3 = await storage.createProduct({
      name: "Kumkumadi Glow Discovery Set",
      description: "Experience the magic of Kumkumadi with this curated set of glow-enhancing products. Powered with saffron, this trio delivers transformative results for radiant, youthful skin.",
      shortDescription: "Glow Trio | Powered With Saffron",
      price: 4250.00,
      imageUrl: "https://images.unsplash.com/photo-1619451683295-87ea57cbdabb",
      stock: 75,
      rating: 5.0,
      totalReviews: 7,
      slug: "kumkumadi-glow-discovery-set",
      categoryId: skinCare.id,
      featured: true,
      bestseller: true,
      isNew: false
    });
    
    const product4 = await storage.createProduct({
      name: "Kumkumadi Brightening Face Oil",
      description: "A luxurious Ayurvedic facial oil infused with saffron and 12 precious herbs to brighten skin, reduce dark spots, and promote a youthful glow.",
      shortDescription: "Luxurious Ayurvedic facial oil for brightening",
      price: 1995.00,
      imageUrl: "https://images.unsplash.com/photo-1629198735566-e36c0bd9ad76",
      stock: 200,
      rating: 5.0,
      totalReviews: 156,
      slug: "kumkumadi-brightening-face-oil",
      categoryId: skinCare.id,
      featured: true,
      bestseller: true,
      isNew: false
    });
    
    const product5 = await storage.createProduct({
      name: "Bringadi Intensive Hair Treatment Oil",
      description: "A potent hair treatment oil formulated with Indigo, Eclipta Alba, and Gooseberry to reduce hair fall, strengthen roots, and promote healthy growth.",
      shortDescription: "Reduces hair fall and promotes growth",
      price: 1695.00,
      imageUrl: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e",
      stock: 180,
      rating: 4.5,
      totalReviews: 124,
      slug: "bringadi-intensive-hair-treatment-oil",
      categoryId: hairCare.id,
      featured: false,
      bestseller: true,
      isNew: false
    });
    
    const product6 = await storage.createProduct({
      name: "Rose Jasmine Face Cleanser",
      description: "A gentle, aromatic cleanser that effectively removes impurities while preserving skin's natural moisture. Infused with rose and jasmine for a sensorial experience.",
      shortDescription: "Gentle cleansing with aromatic benefits",
      price: 1250.00,
      imageUrl: "https://images.unsplash.com/photo-1566958769312-82cef41d19ef",
      stock: 150,
      rating: 5.0,
      totalReviews: 89,
      slug: "rose-jasmine-face-cleanser",
      categoryId: skinCare.id,
      featured: false,
      bestseller: true,
      isNew: false
    });
    
    const product7 = await storage.createProduct({
      name: "Pure Rose Water",
      description: "Steam-distilled pure rose water that tones, hydrates, and refreshes skin. Can be used as a facial toner or added to face packs for enhanced benefits.",
      shortDescription: "Pure, steam-distilled rose hydrosol",
      price: 795.00,
      imageUrl: "https://images.unsplash.com/photo-1601055903647-ddf1ee9701b1",
      stock: 250,
      rating: 4.5,
      totalReviews: 173,
      slug: "pure-rose-water",
      categoryId: skinCare.id,
      featured: false,
      bestseller: true,
      isNew: false
    });

    // Add products to collections
    await storage.addProductToCollection({
      productId: product1.id,
      collectionId: kumkumadi.id
    });
    
    await storage.addProductToCollection({
      productId: product2.id,
      collectionId: kumkumadi.id
    });
    
    await storage.addProductToCollection({
      productId: product3.id,
      collectionId: kumkumadi.id
    });
    
    await storage.addProductToCollection({
      productId: product4.id,
      collectionId: kumkumadi.id
    });
    
    await storage.addProductToCollection({
      productId: product5.id,
      collectionId: ujjasara.id
    });
    
    await storage.addProductToCollection({
      productId: product6.id,
      collectionId: amrrepa.id
    });
    
    await storage.addProductToCollection({
      productId: product7.id,
      collectionId: amrrepa.id
    });
    
    await storage.addProductToCollection({
      productId: product4.id,
      collectionId: bestsellers.id
    });
    
    await storage.addProductToCollection({
      productId: product5.id,
      collectionId: bestsellers.id
    });
    
    await storage.addProductToCollection({
      productId: product6.id,
      collectionId: bestsellers.id
    });
    
    await storage.addProductToCollection({
      productId: product7.id,
      collectionId: bestsellers.id
    });
    
    log('Products created successfully', 'mongodb');
  } catch (error) {
    log(`Error creating products: ${error}`, 'mongodb');
  }
}

// Create testimonials
async function createTestimonials() {
  try {
    await storage.createTestimonial({
      name: "Priya S.",
      location: "Mumbai",
      rating: 5,
      testimonial: "The Kumkumadi face oil has transformed my skin. I've been using it for 3 months now and my skin looks more radiant and even-toned. The natural fragrance is also divine!",
      featured: true
    });
    
    await storage.createTestimonial({
      name: "Rahul M.",
      location: "Bangalore",
      rating: 5,
      testimonial: "I was skeptical about Ayurvedic hair care but Bringadi oil has proven me wrong. My hair fall has reduced significantly and my scalp feels healthier. The best part is that it's all natural!",
      featured: true
    });
    
    await storage.createTestimonial({
      name: "Anita K.",
      location: "Delhi",
      rating: 4,
      testimonial: "The Rose Jasmine face cleanser is gentle yet effective. It removes all my makeup without drying out my skin. The scent is heavenly and leaves my face feeling fresh and clean.",
      featured: true
    });
    
    log('Testimonials created successfully', 'mongodb');
  } catch (error) {
    log(`Error creating testimonials: ${error}`, 'mongodb');
  }
}

// Create banner
async function createBanner() {
  try {
    await storage.createBanner({
      title: "DISCOVER NEXT GENERATION AYURVEDIC SKINCARE",
      subtitle: "CHOOSE ANY COMPLIMENTARY PRODUCTS OF YOUR CHOICE WORTH UPTO ₹3990",
      imageUrl: "https://images.unsplash.com/photo-1617500603321-cae6be1442f1",
      buttonText: "SHOP NOW",
      buttonLink: "/collections/all",
      active: true,
      order: 1
    });
    
    log('Banner created successfully', 'mongodb');
  } catch (error) {
    log(`Error creating banner: ${error}`, 'mongodb');
  }
}

// Create admin user
async function createAdminUser() {
  try {
    const user = await storage.createUser({
      name: "Admin User",
      email: "admin@kamaayurveda.com",
      password: "admin123" // In a real app, this would be hashed
    });
    
    // Update the user to make them an admin (handled separately in our storage implementation)
    if (user) {
      try {
        // Direct database update since our API doesn't expose isAdmin updates
        const UserModel = (await import('./models/User')).default;
        await UserModel.updateOne({ id: user.id }, { $set: { isAdmin: true } });
        log('Admin user created successfully', 'mongodb');
      } catch (error) {
        log(`Failed to set admin privileges: ${error}`, 'mongodb');
      }
    }
  } catch (error) {
    log(`Error creating admin user: ${error}`, 'mongodb');
  }
}