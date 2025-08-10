const User = require('../models/User');
const Box = require('../models/Box');
const Delivery = require('../models/Delivery');
const BoxHistory = require('../models/BoxHistory');

/**
 * @desc    Get system statistics
 * @route   GET /api/stats
 * @access  Private (Admin/Manufacturer)
 */
const getSystemStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Basic counts
    const [
      totalBoxes,
      totalUsers,
      totalDeliveries,
      todayDeliveries,
      weekDeliveries,
      monthDeliveries
    ] = await Promise.all([
      Box.countDocuments(),
      User.countDocuments({ isActive: true }),
      Delivery.countDocuments(),
      Delivery.countDocuments({ deliveryDate: { $gte: startOfDay } }),
      Delivery.countDocuments({ deliveryDate: { $gte: startOfWeek } }),
      Delivery.countDocuments({ deliveryDate: { $gte: startOfMonth } })
    ]);

    // Box status breakdown
    const boxStatusStats = await Box.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Boxes needing retirement
    const boxesNeedingRetirement = await Box.countDocuments({
      $expr: {
        $gte: ['$usageCount', { $multiply: ['$maxUsage', 0.9] }]
      },
      status: { $ne: 'retired' }
    });

    // User role breakdown
    const userRoleStats = await User.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Delivery status breakdown
    const deliveryStatusStats = await Delivery.aggregate([
      {
        $group: {
          _id: '$deliveryStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top manufacturers by box count
    const topManufacturers = await Box.aggregate([
      {
        $group: {
          _id: '$manufacturer',
          boxCount: { $sum: 1 },
          totalUsage: { $sum: '$usageCount' }
        }
      },
      {
        $sort: { boxCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalBoxes,
          totalUsers,
          totalDeliveries,
          boxesNeedingRetirement
        },
        deliveries: {
          today: todayDeliveries,
          thisWeek: weekDeliveries,
          thisMonth: monthDeliveries
        },
        boxStatus: boxStatusStats,
        userRoles: userRoleStats,
        deliveryStatus: deliveryStatusStats,
        topManufacturers
      }
    });

  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

/**
 * @desc    Get delivery analytics
 * @route   GET /api/stats/deliveries
 * @access  Private (Admin/Manufacturer)
 */
const getDeliveryAnalytics = async (req, res) => {
  try {
    const { period = '30d', groupBy = 'day' } = req.query;

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Group by format
    let dateFormat;
    switch (groupBy) {
      case 'hour':
        dateFormat = '%Y-%m-%d %H:00';
        break;
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%Y-W%U';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    // Delivery trends
    const deliveryTrends = await Delivery.aggregate([
      {
        $match: {
          deliveryDate: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: dateFormat,
                date: '$deliveryDate'
              }
            },
            status: '$deliveryStatus'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          deliveries: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Average delivery time by location
    const avgDeliveryTimeByLocation = await Delivery.aggregate([
      {
        $match: {
          deliveryDate: { $gte: startDate, $lte: endDate },
          estimatedDeliveryTime: { $exists: true },
          actualDeliveryTime: { $exists: true }
        }
      },
      {
        $addFields: {
          deliveryDuration: {
            $subtract: ['$actualDeliveryTime', '$estimatedDeliveryTime']
          }
        }
      },
      {
        $group: {
          _id: {
            city: '$deliveryLocation.city',
            state: '$deliveryLocation.state'
          },
          avgDuration: { $avg: '$deliveryDuration' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        groupBy,
        dateRange: { startDate, endDate },
        deliveryTrends,
        avgDeliveryTimeByLocation
      }
    });

  } catch (error) {
    console.error('Get delivery analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching delivery analytics'
    });
  }
};

/**
 * @desc    Get box analytics
 * @route   GET /api/stats/boxes
 * @access  Private (Admin/Manufacturer)
 */
const getBoxAnalytics = async (req, res) => {
  try {
    // Box usage distribution
    const usageDistribution = await Box.aggregate([
      {
        $addFields: {
          usagePercentage: {
            $multiply: [
              { $divide: ['$usageCount', '$maxUsage'] },
              100
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: '$usagePercentage',
          boundaries: [0, 25, 50, 75, 90, 100],
          default: 'over100',
          output: {
            count: { $sum: 1 },
            avgUsage: { $avg: '$usageCount' }
          }
        }
      }
    ]);

    // Box lifecycle analysis
    const lifecycleAnalysis = await Box.aggregate([
      {
        $group: {
          _id: '$manufacturer',
          totalBoxes: { $sum: 1 },
          avgUsage: { $avg: '$usageCount' },
          maxUsageSum: { $sum: '$maxUsage' },
          retiredBoxes: {
            $sum: {
              $cond: [{ $eq: ['$status', 'retired'] }, 1, 0]
            }
          },
          damagedBoxes: {
            $sum: {
              $cond: [{ $eq: ['$status', 'damaged'] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          retirementRate: {
            $multiply: [
              { $divide: ['$retiredBoxes', '$totalBoxes'] },
              100
            ]
          },
          damageRate: {
            $multiply: [
              { $divide: ['$damagedBoxes', '$totalBoxes'] },
              100
            ]
          }
        }
      },
      {
        $sort: { totalBoxes: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        usageDistribution,
        lifecycleAnalysis
      }
    });

  } catch (error) {
    console.error('Get box analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching box analytics'
    });
  }
};

/**
 * @desc    Get activity analytics
 * @route   GET /api/stats/activity
 * @access  Private (Admin/Manufacturer)
 */
const getActivityAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Activity by action type
    const activityByAction = await BoxHistory.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Most active users
    const mostActiveUsers = await BoxHistory.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$performedBy',
          activityCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          role: '$user.role',
          activityCount: 1
        }
      },
      {
        $sort: { activityCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate },
        activityByAction,
        mostActiveUsers
      }
    });

  } catch (error) {
    console.error('Get activity analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activity analytics'
    });
  }
};

module.exports = {
  getSystemStats,
  getDeliveryAnalytics,
  getBoxAnalytics,
  getActivityAnalytics
};
