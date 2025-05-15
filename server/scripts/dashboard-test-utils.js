/**
 * Dashboard Test Utilities
 *
 * This file contains utility functions and sample data for testing the dashboard.
 */

// Simulate coupon statistics for dashboard
const getCouponStatistics = () => {
  return {
    totalCoupons: 7,
    activeCoupons: 5,
    expiredCoupons: 1,
    inactiveCoupons: 1,
    mostUsedCoupon: {
      code: "FREESHIP",
      usedCount: 120,
    },
    totalRedemptions: 207,
    averageDiscount: 37.85, // Average discount percentage/amount across all coupons
  };
};

// Simulate monthly coupon usage for charts
const getMonthlyCouponUsage = () => {
  return [
    { month: "Jan", redemptions: 15 },
    { month: "Feb", redemptions: 22 },
    { month: "Mar", redemptions: 28 },
    { month: "Apr", redemptions: 32 },
    { month: "May", redemptions: 45 },
    { month: "Jun", redemptions: 65 },
  ];
};

// Simulate revenue impact of coupons
const getCouponRevenueImpact = () => {
  return {
    totalRevenue: 1250000,
    discountedRevenue: 975000,
    totalDiscount: 275000,
    conversionRateIncrease: 22, // Percentage increase in conversion when coupons are used
    averageOrderValueWithCoupon: 2850,
    averageOrderValueWithoutCoupon: 1950,
  };
};

// Simulate coupon performance by type
const getCouponPerformanceByType = () => {
  return [
    { type: "percentage", redemptions: 145, averageDiscount: 28.75 },
    { type: "fixed", redemptions: 62, averageDiscount: 300 },
  ];
};

// Test function to add coupon statistics to dashboard
const addCouponStatsToDashboard = async () => {
  try {
    console.log("Adding coupon statistics to dashboard...");

    // Here would be code to add the stats to a database or state
    const stats = getCouponStatistics();
    const monthlyUsage = getMonthlyCouponUsage();
    const revenueImpact = getCouponRevenueImpact();
    const performanceByType = getCouponPerformanceByType();

    console.log("Coupon Statistics:", stats);
    console.log("Monthly Usage:", monthlyUsage);
    console.log("Revenue Impact:", revenueImpact);
    console.log("Performance by Type:", performanceByType);

    return {
      stats,
      monthlyUsage,
      revenueImpact,
      performanceByType,
    };
  } catch (error) {
    console.error("Error adding coupon stats to dashboard:", error);
    throw error;
  }
};

// Sample coupon codes for quick testing
const sampleCouponCodes = [
  "WELCOME25", // 25% off, min cart value ₹1000
  "SUMMER50", // 50% off, min cart value ₹2000
  "FLAT500", // ₹500 off, min cart value ₹3000
  "FREESHIP", // ₹100 off (shipping), min cart value ₹1000
];

module.exports = {
  getCouponStatistics,
  getMonthlyCouponUsage,
  getCouponRevenueImpact,
  getCouponPerformanceByType,
  addCouponStatsToDashboard,
  sampleCouponCodes,
};
