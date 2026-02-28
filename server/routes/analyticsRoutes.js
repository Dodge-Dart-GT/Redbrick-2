const express = require('express');
const router = express.Router();
const RentalRequest = require('../models/RentalRequest');
const Forklift = require('../models/Forklift');
const User = require('../models/User');
const { protect, adminOrOwner } = require('../middleware/authMiddleware');

router.get('/', protect, adminOrOwner, async (req, res) => {
  try {
    const { timeframe } = req.query; // 'week', 'month', 'year', or 'all'
    let dateMatch = {};
    
    // 1. GLOBAL TIMEFRAME FILTER (Applies to Charts & KPIs)
    if (timeframe === 'week') {
      const lastWeek = new Date(); lastWeek.setDate(lastWeek.getDate() - 7);
      dateMatch = { createdAt: { $gte: lastWeek } };
    } else if (timeframe === 'month') {
      const lastMonth = new Date(); lastMonth.setMonth(lastMonth.getMonth() - 1);
      dateMatch = { createdAt: { $gte: lastMonth } };
    } else if (timeframe === 'year') {
      const lastYear = new Date(); lastYear.setFullYear(lastYear.getFullYear() - 1);
      dateMatch = { createdAt: { $gte: lastYear } };
    } 

    // 2. KPI CARDS (Swapped Revenue for Unique Customers)
    const totalRentals = await RentalRequest.countDocuments(dateMatch);
    const activeRentals = await RentalRequest.countDocuments({ ...dateMatch, status: 'Active' });
    const uniqueUsersArray = await RentalRequest.distinct('user', dateMatch);
    const totalUniqueCustomers = uniqueUsersArray.length;

    // 3. RENTAL TRENDS (Line Chart - Now only tracks Frequency)
    let groupStage = {};
    if (timeframe === 'week' || timeframe === 'month') {
       groupStage = {
          _id: { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          rentals: { $sum: 1 }
       };
    } else {
       groupStage = {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          rentals: { $sum: 1 }
       };
    }

    const trends = await RentalRequest.aggregate([
      { $match: dateMatch },
      { $group: groupStage },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    const formattedTrends = trends.map(t => {
      if (t._id.day) {
        const date = new Date(t._id.year, t._id.month - 1, t._id.day);
        return { name: date.toLocaleDateString('default', { month: 'short', day: 'numeric' }), rentals: t.rentals };
      } else {
        const date = new Date(t._id.year, t._id.month - 1, 1);
        return { name: date.toLocaleString('default', { month: 'short', year: 'numeric' }), rentals: t.rentals };
      }
    });

    // 4. FORKLIFT UTILIZATION (Bar Chart)
    const utilization = await RentalRequest.aggregate([
      { $match: { ...dateMatch, status: { $ne: 'Rejected' } } },
      { $group: { _id: "$forklift", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 } 
    ]);

    const populatedUtilization = await Forklift.populate(utilization, { path: '_id', select: 'make model' });
    const formattedUtilization = populatedUtilization.map(u => ({
      name: u._id ? `${u._id.make} ${u._id.model}` : 'Deleted Vehicle',
      rentals: u.count
    }));

    // 5. CUSTOMER FREQUENCY BREAKDOWN (Calculates exact dates for the table)
    const now = new Date();
    const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last365 = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const topCustomers = await RentalRequest.aggregate([
      { $match: { status: { $ne: 'Rejected' } } }, // Notice we skip dateMatch so the table shows all-time history
      { $group: { 
          _id: "$user", 
          totalRentals: { $sum: 1 },
          rentalsWeek: { $sum: { $cond: [{ $gte: ["$createdAt", last7] }, 1, 0] } },
          rentalsMonth: { $sum: { $cond: [{ $gte: ["$createdAt", last30] }, 1, 0] } },
          rentalsYear: { $sum: { $cond: [{ $gte: ["$createdAt", last365] }, 1, 0] } }
        } 
      },
      { $sort: { totalRentals: -1 } },
      { $limit: 10 } // Show top 10 customers
    ]);

    const populatedCustomers = await User.populate(topCustomers, { path: '_id', select: 'firstName lastName email' });

    res.json({
      kpis: { totalRentals, activeRentals, totalUniqueCustomers },
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