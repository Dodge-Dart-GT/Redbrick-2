const express = require('express');
const router = express.Router();
const RentalRequest = require('../models/RentalRequest');
const Forklift = require('../models/Forklift');
const User = require('../models/User');
const { protect, adminOrOwner } = require('../middleware/authMiddleware');

// @desc    Get all analytics data for the dashboard
// @route   GET /api/analytics
// @access  Private (Admin/Owner only)
router.get('/', protect, adminOrOwner, async (req, res) => {
  try {
    // 1. KPI CARDS (Total Revenue, Total Rentals, etc.)
    const totalRentals = await RentalRequest.countDocuments();
    const activeRentals = await RentalRequest.countDocuments({ status: 'Active' });
    
    // Calculate total revenue from Active and Completed rentals
    const revenueData = await RentalRequest.aggregate([
      { $match: { status: { $in: ['Active', 'Completed'] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalCost" } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // 2. INCOME & RENTAL TRENDS (Grouped by Month)
    const trends = await RentalRequest.aggregate([
      { 
        $project: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
          totalCost: 1
        }
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          rentals: { $sum: 1 },
          income: { $sum: "$totalCost" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format trends for Recharts (e.g., "Jan 2026")
    const formattedTrends = trends.map(t => {
      const date = new Date(t._id.year, t._id.month - 1, 1);
      return {
        name: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        rentals: t.rentals,
        income: t.income
      };
    });

    // 3. FORKLIFT UTILIZATION (Most Rented Equipment)
    const utilization = await RentalRequest.aggregate([
      { $match: { status: { $ne: 'Rejected' } } },
      { $group: { _id: "$forklift", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 } // Top 5
    ]);

    // Populate the forklift details for the chart
    const populatedUtilization = await Forklift.populate(utilization, { path: '_id', select: 'make model' });
    const formattedUtilization = populatedUtilization.map(u => ({
      name: u._id ? `${u._id.make} ${u._id.model}` : 'Deleted Vehicle',
      rentals: u.count
    }));

    // 4. CUSTOMER ACTIVITY (Top Renters)
    const topCustomers = await RentalRequest.aggregate([
      { $match: { status: { $ne: 'Rejected' } } },
      { $group: { _id: "$user", rentalsCount: { $sum: 1 }, totalSpent: { $sum: "$totalCost" } } },
      { $sort: { rentalsCount: -1 } },
      { $limit: 5 }
    ]);

    const populatedCustomers = await User.populate(topCustomers, { path: '_id', select: 'firstName lastName email' });

    // Send everything back in one clean package
    res.json({
      kpis: { totalRentals, activeRentals, totalRevenue },
      trends: formattedTrends,
      utilization: formattedUtilization,
      topCustomers: populatedCustomers
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: 'Server Error: Could not fetch analytics data.' });
  }
});

module.exports = router;