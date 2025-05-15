/**
 * Test Coupon Application with Sample Cart
 *
 * This script simulates coupon validation and application with different cart scenarios.
 * Run it to test if coupons are correctly applied based on cart value and other conditions.
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Create a mongoose model for Coupon
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

// Sample cart scenarios for testing
const cartScenarios = [
  {
    name: "Small Cart",
    items: [
      { name: "T-shirt", price: 499, quantity: 1 },
      { name: "Socks", price: 199, quantity: 2 },
    ],
    total: 897, // Below 1000 threshold
  },
  {
    name: "Medium Cart",
    items: [
      { name: "Jeans", price: 1299, quantity: 1 },
      { name: "T-shirt", price: 499, quantity: 1 },
    ],
    total: 1798, // Above 1000, below 2000 threshold
  },
  {
    name: "Large Cart",
    items: [
      { name: "Leather Jacket", price: 2499, quantity: 1 },
      { name: "Jeans", price: 1299, quantity: 1 },
      { name: "T-shirt", price: 499, quantity: 1 },
    ],
    total: 4297, // Above 3000 threshold
  },
];

// Function to validate coupon with cart value
async function validateCoupon(code, cartValue) {
  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return { valid: false, message: "Invalid coupon code" };
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return { valid: false, message: "This coupon is inactive" };
    }

    // Check dates
    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return {
        valid: false,
        message: "This coupon has expired or is not yet active",
      };
    }

    // Check usage limit
    if (coupon.maxUses !== -1 && coupon.usedCount >= coupon.maxUses) {
      return {
        valid: false,
        message: "This coupon has reached its usage limit",
      };
    }

    // Check minimum cart value
    if (cartValue < coupon.minimumCartValue) {
      return {
        valid: false,
        message: `Minimum cart value of ${coupon.minimumCartValue} required for this coupon`,
        minimumCartValue: coupon.minimumCartValue,
      };
    }

    // Calculate discount
    let discountValue = 0;
    if (coupon.discountType === "percentage") {
      discountValue = (cartValue * coupon.discountAmount) / 100;
    } else {
      discountValue = coupon.discountAmount;
    }

    // Return successful validation
    return {
      valid: true,
      coupon,
      discountValue,
      message: "Coupon applied successfully",
    };
  } catch (error) {
    console.error("Error validating coupon:", error);
    return { valid: false, message: "Error validating coupon" };
  }
}

// Function to test all coupons with all cart scenarios
async function testCouponsWithCarts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ecommercepro"
    );
    console.log("Connected to MongoDB\n");

    // Get all coupons
    const coupons = await Coupon.find();

    console.log(
      `=== Testing ${coupons.length} coupons with ${cartScenarios.length} cart scenarios ===\n`
    );

    // Test each coupon with each cart scenario
    for (const coupon of coupons) {
      console.log(`\nTesting Coupon: ${coupon.code} (${coupon.description})`);
      console.log(
        `Discount: ${coupon.discountAmount}${
          coupon.discountType === "percentage" ? "%" : "₹"
        }, Min Cart: ₹${coupon.minimumCartValue}`
      );
      console.log("-".repeat(80));

      for (const cart of cartScenarios) {
        const result = await validateCoupon(coupon.code, cart.total);

        console.log(`Cart: ${cart.name} (₹${cart.total})`);
        console.log(`Valid: ${result.valid ? "Yes" : "No"}`);
        console.log(`Message: ${result.message}`);

        if (result.valid) {
          console.log(`Discount: ₹${result.discountValue.toFixed(2)}`);
          console.log(
            `Final Total: ₹${(cart.total - result.discountValue).toFixed(2)}`
          );
        }
        console.log("-".repeat(40));
      }
    }

    // Summary for quick testing
    console.log("\n=== Quick Testing Reference ===");
    console.log("Use these coupons on the frontend:");
    console.log("- WELCOME25: Works with carts ≥ ₹1000");
    console.log("- SUMMER50: Works with carts ≥ ₹2000");
    console.log("- FLAT500: Works with carts ≥ ₹3000");
    console.log("- FREESHIP: Works with carts ≥ ₹1000");
    console.log("- EXPIRED20: Should always fail (expired)");
    console.log("- FUTURE30: Should always fail (not yet active)");
    console.log("- INACTIVE40: Should always fail (inactive)");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error testing coupons:", error);
  }
}

// Run the test function
testCouponsWithCarts();
