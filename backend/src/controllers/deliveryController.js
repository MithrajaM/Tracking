const Delivery = require('../models/Delivery');
const Box = require('../models/Box');
const BoxHistory = require('../models/BoxHistory');
const { validationResult } = require('express-validator');
const { getFileUrl, deleteFile } = require('../middleware/upload');

/**
 * @desc    Create a new delivery
 * @route   POST /api/deliveries
 * @access  Private (End User/Agent)
 */
const createDelivery = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { boxId } = req.body;

    // Find the box
    let box = await Box.findOne({ boxId: boxId.toUpperCase() });
    if (!box) {
      return res.status(404).json({
        success: false,
        message: 'Box not found'
      });
    }

    // Check if box is already retired
    if (box.status === 'retired') {
      return res.status(400).json({
        success: false,
        message: 'Cannot deliver a retired box'
      });
    }

    // Prepare delivery data
    const deliveryData = {
      ...req.body,
      boxId: box.boxId,
      box: box._id,
      deliveredBy: req.user._id
    };

    // Handle file upload
    if (req.file) {
      deliveryData.deliveryPhoto = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        localPath: req.file.path,
        url: getFileUrl(req, req.file.filename, 'deliveries')
      };
    }

    // Create delivery
    const delivery = await Delivery.create(deliveryData);

    // Increment box usage count
    await box.incrementUsage();

    // Create history entries
    await BoxHistory.createEntry({
      box: box._id,
      boxId: box.boxId,
      action: 'delivered',
      performedBy: req.user._id,
      details: `Box delivered to ${delivery.recipient.name} at ${delivery.deliveryLocation.address}`,
      relatedDelivery: delivery._id
    });

    await BoxHistory.createEntry({
      box: box._id,
      boxId: box.boxId,
      action: 'usage_incremented',
      performedBy: req.user._id,
      details: `Usage count incremented to ${box.usageCount}`,
      previousValue: box.usageCount - 1,
      newValue: box.usageCount
    });

    // Populate delivery data
    const populatedDelivery = await Delivery.findById(delivery._id)
      .populate('deliveredBy', 'name email')
      .populate('box', 'boxId manufacturer status usageCount');

    res.status(201).json({
      success: true,
      message: 'Delivery created successfully',
      data: { delivery: populatedDelivery }
    });

  } catch (error) {
    // Clean up uploaded file if delivery creation fails
    if (req.file) {
      deleteFile(req.file.path);
    }

    console.error('Create delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during delivery creation'
    });
  }
};

/**
 * @desc    Get all deliveries with filtering
 * @route   GET /api/deliveries
 * @access  Private
 */
const getDeliveries = async (req, res) => {
  try {
    const {
      boxId,
      deliveredBy,
      status,
      startDate,
      endDate,
      city,
      state,
      page = 1,
      limit = 10,
      sortBy = 'deliveryDate',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (boxId) {
      query.boxId = boxId.toUpperCase();
    }

    if (deliveredBy) {
      query.deliveredBy = deliveredBy;
    }

    if (status) {
      query.deliveryStatus = status;
    }

    // Date range filter
    if (startDate || endDate) {
      query.deliveryDate = {};
      if (startDate) query.deliveryDate.$gte = new Date(startDate);
      if (endDate) query.deliveryDate.$lte = new Date(endDate);
    }

    // Location filters
    if (city) {
      query['deliveryLocation.city'] = new RegExp(city, 'i');
    }
    if (state) {
      query['deliveryLocation.state'] = new RegExp(state, 'i');
    }

    // Role-based filtering
    if (req.user.role === 'end-user') {
      // End users can only see their own deliveries
      query.deliveredBy = req.user._id;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const deliveries = await Delivery.find(query)
      .populate('deliveredBy', 'name email')
      .populate('box', 'boxId manufacturer status')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Delivery.countDocuments(query);

    res.json({
      success: true,
      data: {
        deliveries,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching deliveries'
    });
  }
};

/**
 * @desc    Get delivery by ID
 * @route   GET /api/deliveries/:id
 * @access  Private
 */
const getDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    const delivery = await Delivery.findById(id)
      .populate('deliveredBy', 'name email role')
      .populate('box', 'boxId manufacturer status usageCount maxUsage');

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    // Check permissions
    if (req.user.role === 'end-user' && delivery.deliveredBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this delivery'
      });
    }

    res.json({
      success: true,
      data: { delivery }
    });

  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching delivery'
    });
  }
};

/**
 * @desc    Get delivery history for a specific box
 * @route   GET /api/deliveries/box/:boxId
 * @access  Private
 */
const getBoxDeliveryHistory = async (req, res) => {
  try {
    const { boxId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if box exists
    const box = await Box.findOne({ boxId: boxId.toUpperCase() });
    if (!box) {
      return res.status(404).json({
        success: false,
        message: 'Box not found'
      });
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const deliveries = await Delivery.find({ boxId: boxId.toUpperCase() })
      .populate('deliveredBy', 'name email')
      .sort({ deliveryDate: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Delivery.countDocuments({ boxId: boxId.toUpperCase() });

    res.json({
      success: true,
      data: {
        box: {
          boxId: box.boxId,
          manufacturer: box.manufacturer,
          status: box.status,
          usageCount: box.usageCount,
          maxUsage: box.maxUsage
        },
        deliveries,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get box delivery history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching delivery history'
    });
  }
};

/**
 * @desc    Update delivery status
 * @route   PATCH /api/deliveries/:id
 * @access  Private (Admin/Manufacturer)
 */
const updateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatus, notes } = req.body;

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    // Check permissions
    if (req.user.role === 'end-user' && delivery.deliveredBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this delivery'
      });
    }

    const updateData = {};
    if (deliveryStatus) updateData.deliveryStatus = deliveryStatus;
    if (notes !== undefined) updateData.notes = notes;

    const updatedDelivery = await Delivery.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('deliveredBy', 'name email')
      .populate('box', 'boxId manufacturer status');

    res.json({
      success: true,
      message: 'Delivery updated successfully',
      data: { delivery: updatedDelivery }
    });

  } catch (error) {
    console.error('Update delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during delivery update'
    });
  }
};

module.exports = {
  createDelivery,
  getDeliveries,
  getDelivery,
  getBoxDeliveryHistory,
  updateDelivery
};
