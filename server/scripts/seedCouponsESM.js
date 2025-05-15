import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get current file path (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const CouponModel = mongoose.model("Coupon", CouponSchema);

// Sample coupons
const sampleCoupons = [
  {
    code: "WELCOME10",
    description: "10% off your first order",
    discountAmount: 10,
    discountType: "percentage",
    minimumCartValue: 20,
    maxUses: 500,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
    isActive: true,
  },
  {
    code: "SUMMER25",
    description: "25% off summer collection",
    discountAmount: 25,
    discountType: "percentage",
    minimumCartValue: 50,
    maxUses: 200,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
    isActive: true,
  },
  {
    code: "FLAT50",
    description: "₹50 off on orders above ₹500",
    discountAmount: 50,
    discountType: "fixed",
    minimumCartValue: 500,
    maxUses: 100,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    isActive: true,
  },
  {
    code: "EXPIRED20",
    description: "20% off (expired)",
    discountAmount: 20,
    discountType: "percentage",
    minimumCartValue: 30,
    maxUses: 100,
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 2)),
    endDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    isActive: true,
  },
  {
    code: "FUTURE15",
    description: "15% off (future start date)",
    discountAmount: 15,
    discountType: "percentage",
    minimumCartValue: 25,
    maxUses: 150,
    startDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    isActive: true,
  },
  {
    code: "INACTIVE25",
    description: "25% off (inactive)",
    discountAmount: 25,
    discountType: "percentage",
    minimumCartValue: 40,
    maxUses: 75,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
    isActive: false,
  },
  {
    code: "FREESHIP",
    description: "Free shipping on orders over ₹999",
    discountAmount: 100,
    discountType: "fixed",
    minimumCartValue: 999,
    maxUses: 50,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    isActive: true,
  },
];

// Connect to MongoDB
const MONGODB_URI =
  process.env.MONGODB_URL ||
  process.env.MONGODB_URI ||
  "mongodb+srv://admin:Sshiv12345@cluster0.4fs9ylv.mongodb.net/newecom";

try {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // First, clean existing coupons to avoid duplicates
  console.log("Deleting existing coupons...");
  const deletedCount = await CouponModel.deleteMany({});
  console.log(`Deleted ${deletedCount.deletedCount} existing coupons`);

  // Insert sample coupons
  console.log("\nInserting sample coupons:");
  let insertedCount = 0;

  for (const coupon of sampleCoupons) {
    try {
      const newCoupon = await CouponModel.create(coupon);
      console.log(
        `✅ Created coupon: ${newCoupon.code} - ${newCoupon.description}`
      );
      insertedCount++;
    } catch (error) {
      console.error(
        `❌ Failed to create coupon ${coupon.code}: ${error.message}`
      );
    }
  }

  console.log(
    `\n✅ Successfully added ${insertedCount} out of ${sampleCoupons.length} coupons`
  );
  console.log("Seed process completed");

  // Disconnect from MongoDB
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
} catch (error) {
  console.error("Error:", error);
}
