const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Create a mongoose model for Coupon since we're running this script directly
const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, required: true },
    discountAmount: { type: Number, required: true, min: 0 },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    minimumCartValue: { type: Number, default: 0, min: 0 },
    maxUses: { type: Number, default: -1 }, // -1 means unlimited
    usedCount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", CouponSchema);

// Sample coupon data
const sampleCoupons = [
  {
    code: "WELCOME25",
    description: "Welcome offer: 25% off on your first purchase",
    discountAmount: 25,
    discountType: "percentage",
    minimumCartValue: 1000,
    maxUses: 1,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)), // Valid for 3 months
    isActive: true,
    usedCount: 0,
  },
  {
    code: "SUMMER50",
    description: "Summer sale: 50% off on all products",
    discountAmount: 50,
    discountType: "percentage",
    minimumCartValue: 2000,
    maxUses: 100,
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Valid for 30 days
    isActive: true,
    usedCount: 12,
  },
  {
    code: "FLAT500",
    description: "Flat ₹500 off on orders above ₹3000",
    discountAmount: 500,
    discountType: "fixed",
    minimumCartValue: 3000,
    maxUses: -1, // Unlimited uses
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 15)), // Valid for 15 days
    isActive: true,
    usedCount: 45,
  },
  {
    code: "EXPIRED20",
    description: "Expired coupon for testing",
    discountAmount: 20,
    discountType: "percentage",
    minimumCartValue: 1000,
    maxUses: 50,
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 2)),
    endDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    isActive: true,
    usedCount: 30,
  },
  {
    code: "FUTURE30",
    description: "Future promotion: 30% off",
    discountAmount: 30,
    discountType: "percentage",
    minimumCartValue: 1500,
    maxUses: 200,
    startDate: new Date(new Date().setDate(new Date().getDate() + 10)),
    endDate: new Date(new Date().setDate(new Date().getDate() + 40)),
    isActive: true,
    usedCount: 0,
  },
  {
    code: "INACTIVE40",
    description: "Inactive coupon for testing",
    discountAmount: 40,
    discountType: "percentage",
    minimumCartValue: 2500,
    maxUses: 75,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    isActive: false,
    usedCount: 0,
  },
  {
    code: "FREESHIP",
    description: "Free shipping on orders above ₹1000",
    discountAmount: 100,
    discountType: "fixed",
    minimumCartValue: 1000,
    maxUses: -1,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
    isActive: true,
    usedCount: 120,
  },
];

async function seedCoupons() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ecommercepro"
    );
    console.log("Connected to MongoDB");

    // Delete existing coupons
    await Coupon.deleteMany({});
    console.log("Deleted existing coupons");

    // Insert sample coupons
    const insertedCoupons = await Coupon.insertMany(sampleCoupons);
    console.log(`Inserted ${insertedCoupons.length} sample coupons`);

    // Display coupon codes for testing
    console.log("\nCoupon codes for testing:");
    insertedCoupons.forEach((coupon) => {
      console.log(`- ${coupon.code}: ${coupon.description}`);
    });

    console.log(
      "\nYou can use these coupons to test the coupon management system."
    );
    console.log(
      "To test the frontend validation, use coupon WELCOME25 with a cart value of at least ₹1000."
    );

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding coupons:", error);
  }
}

// Run the seed function
seedCoupons();
