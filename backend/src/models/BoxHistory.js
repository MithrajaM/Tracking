const mongoose = require('mongoose');

const boxHistorySchema = new mongoose.Schema({
  box: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Box',
    required: [true, 'Box reference is required']
  },
  boxId: {
    type: String,
    required: [true, 'Box ID is required'],
    trim: true,
    uppercase: true
  },
  action: {
    type: String,
    enum: {
      values: [
        'created',
        'delivered',
        'status_changed',
        'flagged_damaged',
        'retired',
        'location_updated',
        'usage_incremented',
        'notes_updated'
      ],
      message: 'Invalid action type'
    },
    required: [true, 'Action is required']
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Performed by user is required']
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  details: {
    type: String,
    maxlength: [500, 'Details cannot exceed 500 characters'],
    trim: true
  },
  previousValue: {
    type: mongoose.Schema.Types.Mixed // Can store any type of data
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed // Can store any type of data
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: {
      latitude: Number,
      longitude: Number
    },
    deviceInfo: String
  },
  relatedDelivery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
boxHistorySchema.index({ box: 1, timestamp: -1 });
boxHistorySchema.index({ boxId: 1, timestamp: -1 });
boxHistorySchema.index({ performedBy: 1, timestamp: -1 });
boxHistorySchema.index({ action: 1, timestamp: -1 });
boxHistorySchema.index({ timestamp: -1 });

// Virtual for formatted timestamp
boxHistorySchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toLocaleString();
});

// Virtual for action description
boxHistorySchema.virtual('actionDescription').get(function() {
  const descriptions = {
    'created': 'Box was created',
    'delivered': 'Box was delivered',
    'status_changed': 'Box status was changed',
    'flagged_damaged': 'Box was flagged as damaged',
    'retired': 'Box was retired',
    'location_updated': 'Box location was updated',
    'usage_incremented': 'Box usage count was incremented',
    'notes_updated': 'Box notes were updated'
  };
  
  return descriptions[this.action] || 'Unknown action';
});

// Static method to create history entry
boxHistorySchema.statics.createEntry = async function(data) {
  const entry = new this(data);
  return await entry.save();
};

// Static method to get box timeline
boxHistorySchema.statics.getBoxTimeline = function(boxId, limit = 50) {
  return this.find({ boxId })
    .populate('performedBy', 'name email role')
    .populate('relatedDelivery', 'deliveryDate recipient.name')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get user activity
boxHistorySchema.statics.getUserActivity = function(userId, limit = 50) {
  return this.find({ performedBy: userId })
    .populate('box', 'boxId manufacturer')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get activity by date range
boxHistorySchema.statics.getActivityByDateRange = function(startDate, endDate) {
  return this.find({
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  })
  .populate('performedBy', 'name email role')
  .populate('box', 'boxId manufacturer')
  .sort({ timestamp: -1 });
};

// Static method to get activity statistics
boxHistorySchema.statics.getActivityStats = function(startDate, endDate) {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.timestamp = {};
    if (startDate) matchStage.timestamp.$gte = startDate;
    if (endDate) matchStage.timestamp.$lte = endDate;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          action: '$action',
          date: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp'
            }
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.action',
        totalCount: { $sum: '$count' },
        dailyActivity: {
          $push: {
            date: '$_id.date',
            count: '$count'
          }
        }
      }
    },
    {
      $sort: { totalCount: -1 }
    }
  ]);
};

// Pre-save middleware to ensure boxId matches box reference
boxHistorySchema.pre('save', async function(next) {
  if (this.isNew && this.box && !this.boxId) {
    try {
      const Box = mongoose.model('Box');
      const box = await Box.findById(this.box);
      if (box) {
        this.boxId = box.boxId;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('BoxHistory', boxHistorySchema);
