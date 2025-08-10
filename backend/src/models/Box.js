const mongoose = require('mongoose');

const boxSchema = new mongoose.Schema({
  boxId: {
    type: String,
    required: [true, 'Box ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9]{3,20}$/, 'Box ID must be 3-20 alphanumeric characters']
  },
  status: {
    type: String,
    enum: {
      values: ['new', 'in-use', 'damaged', 'retired'],
      message: 'Status must be new, in-use, damaged, or retired'
    },
    default: 'new'
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  maxUsage: {
    type: Number,
    default: 20,
    min: [1, 'Max usage must be at least 1']
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true,
    maxlength: [100, 'Manufacturer name cannot exceed 100 characters']
  },
  currentLocation: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    unit: { type: String, enum: ['cm', 'inch'], default: 'cm' }
  },
  weight: {
    value: { type: Number, min: 0 },
    unit: { type: String, enum: ['kg', 'lb'], default: 'kg' }
  },
  material: {
    type: String,
    trim: true,
    maxlength: [50, 'Material cannot exceed 50 characters']
  },
  qrCode: {
    type: String,
    unique: true,
    sparse: true // Allow multiple null values
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  retiredAt: {
    type: Date
  },
  retiredReason: {
    type: String,
    maxlength: [200, 'Retired reason cannot exceed 200 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
boxSchema.index({ boxId: 1 });
boxSchema.index({ status: 1 });
boxSchema.index({ manufacturer: 1 });
boxSchema.index({ createdBy: 1 });
boxSchema.index({ qrCode: 1 });

// Virtual for usage percentage
boxSchema.virtual('usagePercentage').get(function() {
  return Math.round((this.usageCount / this.maxUsage) * 100);
});

// Virtual for retirement status
boxSchema.virtual('needsRetirement').get(function() {
  return this.usageCount >= this.maxUsage * 0.9; // 90% threshold
});

// Virtual for box condition
boxSchema.virtual('condition').get(function() {
  if (this.status === 'damaged') return 'damaged';
  if (this.status === 'retired') return 'retired';
  
  const percentage = this.usagePercentage;
  if (percentage >= 90) return 'retire-soon';
  if (percentage >= 70) return 'high-usage';
  if (percentage >= 40) return 'medium-usage';
  return 'low-usage';
});

// Pre-save middleware
boxSchema.pre('save', function(next) {
  // Auto-generate QR code if not provided
  if (!this.qrCode) {
    this.qrCode = this.boxId;
  }
  
  // Auto-retire if max usage reached
  if (this.usageCount >= this.maxUsage && this.status !== 'retired') {
    this.status = 'retired';
    this.retiredAt = new Date();
    this.retiredReason = 'Maximum usage count reached';
  }
  
  next();
});

// Static method to find boxes by status
boxSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to find boxes needing retirement
boxSchema.statics.findNeedingRetirement = function() {
  return this.find({
    $expr: {
      $gte: ['$usageCount', { $multiply: ['$maxUsage', 0.9] }]
    },
    status: { $ne: 'retired' }
  });
};

// Instance method to increment usage
boxSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Instance method to retire box
boxSchema.methods.retire = function(reason, userId) {
  this.status = 'retired';
  this.retiredAt = new Date();
  this.retiredReason = reason || 'Manual retirement';
  this.lastModifiedBy = userId;
  return this.save();
};

module.exports = mongoose.model('Box', boxSchema);
