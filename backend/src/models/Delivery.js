const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  boxId: {
    type: String,
    required: [true, 'Box ID is required'],
    trim: true,
    uppercase: true
  },
  box: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Box',
    required: [true, 'Box reference is required']
  },
  deliveredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Delivered by user is required']
  },
  deliveryDate: {
    type: Date,
    default: Date.now,
    required: [true, 'Delivery date is required']
  },
  deliveryLocation: {
    address: {
      type: String,
      required: [true, 'Delivery address is required'],
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters']
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'US' }
  },
  recipient: {
    name: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true,
      maxlength: [100, 'Recipient name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    signature: {
      type: String // Base64 encoded signature image
    }
  },
  deliveryPhoto: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String, // For cloud storage
    localPath: String // For local storage
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  },
  deliveryStatus: {
    type: String,
    enum: {
      values: ['delivered', 'attempted', 'failed', 'returned'],
      message: 'Status must be delivered, attempted, failed, or returned'
    },
    default: 'delivered'
  },
  attemptNumber: {
    type: Number,
    default: 1,
    min: [1, 'Attempt number must be at least 1']
  },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  deliveryInstructions: {
    type: String,
    maxlength: [300, 'Delivery instructions cannot exceed 300 characters']
  },
  packageCondition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'damaged'],
    default: 'excellent'
  },
  weatherConditions: {
    type: String,
    maxlength: [100, 'Weather conditions cannot exceed 100 characters']
  },
  verificationCode: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
deliverySchema.index({ boxId: 1 });
deliverySchema.index({ box: 1 });
deliverySchema.index({ deliveredBy: 1 });
deliverySchema.index({ deliveryDate: -1 });
deliverySchema.index({ deliveryStatus: 1 });
deliverySchema.index({ 'deliveryLocation.city': 1 });
deliverySchema.index({ 'deliveryLocation.state': 1 });

// Compound indexes
deliverySchema.index({ boxId: 1, deliveryDate: -1 });
deliverySchema.index({ deliveredBy: 1, deliveryDate: -1 });

// Virtual for delivery duration (if estimated time exists)
deliverySchema.virtual('deliveryDuration').get(function() {
  if (this.estimatedDeliveryTime && this.actualDeliveryTime) {
    return this.actualDeliveryTime - this.estimatedDeliveryTime; // in milliseconds
  }
  return null;
});

// Virtual for formatted delivery date
deliverySchema.virtual('formattedDeliveryDate').get(function() {
  return this.deliveryDate.toLocaleDateString();
});

// Virtual for delivery summary
deliverySchema.virtual('summary').get(function() {
  return {
    id: this._id,
    boxId: this.boxId,
    deliveryDate: this.deliveryDate,
    status: this.deliveryStatus,
    location: this.deliveryLocation.address,
    recipient: this.recipient.name
  };
});

// Pre-save middleware
deliverySchema.pre('save', function(next) {
  // Set actual delivery time if not set and status is delivered
  if (this.deliveryStatus === 'delivered' && !this.actualDeliveryTime) {
    this.actualDeliveryTime = this.deliveryDate;
  }
  
  next();
});

// Static method to find deliveries by date range
deliverySchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    deliveryDate: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ deliveryDate: -1 });
};

// Static method to find deliveries by location
deliverySchema.statics.findByLocation = function(city, state) {
  const query = {};
  if (city) query['deliveryLocation.city'] = new RegExp(city, 'i');
  if (state) query['deliveryLocation.state'] = new RegExp(state, 'i');
  
  return this.find(query).sort({ deliveryDate: -1 });
};

// Static method to get delivery statistics
deliverySchema.statics.getDeliveryStats = function(startDate, endDate) {
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.deliveryDate = {};
    if (startDate) matchStage.deliveryDate.$gte = startDate;
    if (endDate) matchStage.deliveryDate.$lte = endDate;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$deliveryStatus',
        count: { $sum: 1 },
        avgAttempts: { $avg: '$attemptNumber' }
      }
    }
  ]);
};

module.exports = mongoose.model('Delivery', deliverySchema);
