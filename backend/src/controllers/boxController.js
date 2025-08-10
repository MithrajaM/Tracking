const Box = require('../models/Box');
const BoxHistory = require('../models/BoxHistory');
const { validationResult } = require('express-validator');

/**
 * @desc    Create a new box
 * @route   POST /api/boxes
 * @access  Private (Manufacturer/Admin)
 */
const createBox = async (req, res) => {
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

    const boxData = {
      ...req.body,
      createdBy: req.user._id
    };

    const box = await Box.create(boxData);

    // Create history entry
    await BoxHistory.createEntry({
      box: box._id,
      boxId: box.boxId,
      action: 'created',
      performedBy: req.user._id,
      details: `Box created by ${req.user.name}`
    });

    res.status(201).json({
      success: true,
      message: 'Box created successfully',
      data: { box }
    });

  } catch (error) {
    console.error('Create box error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during box creation'
    });
  }
};

/**
 * @desc    Get box by ID or boxId
 * @route   GET /api/boxes/:id
 * @access  Private
 */
const getBox = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find by MongoDB _id first, then by boxId
    let box = await Box.findById(id).populate('createdBy', 'name email');
    
    if (!box) {
      box = await Box.findOne({ boxId: id.toUpperCase() }).populate('createdBy', 'name email');
    }

    if (!box) {
      return res.status(404).json({
        success: false,
        message: 'Box not found'
      });
    }

    // Get box history
    const history = await BoxHistory.getBoxTimeline(box.boxId, 10);

    res.json({
      success: true,
      data: {
        box,
        history
      }
    });

  } catch (error) {
    console.error('Get box error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching box'
    });
  }
};

/**
 * @desc    Get all boxes with filtering
 * @route   GET /api/boxes
 * @access  Private
 */
const getBoxes = async (req, res) => {
  try {
    const {
      status,
      manufacturer,
      location,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (manufacturer) {
      query.manufacturer = new RegExp(manufacturer, 'i');
    }
    
    if (location) {
      query.currentLocation = new RegExp(location, 'i');
    }

    if (search) {
      query.$or = [
        { boxId: new RegExp(search, 'i') },
        { manufacturer: new RegExp(search, 'i') },
        { currentLocation: new RegExp(search, 'i') }
      ];
    }

    // Role-based filtering
    if (req.user.role === 'manufacturer') {
      // Manufacturers can only see boxes they created
      query.createdBy = req.user._id;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const boxes = await Box.find(query)
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Box.countDocuments(query);

    res.json({
      success: true,
      data: {
        boxes,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get boxes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching boxes'
    });
  }
};

/**
 * @desc    Update box status
 * @route   PATCH /api/boxes/:id/status
 * @access  Private (Manufacturer/Admin)
 */
const updateBoxStatus = async (req, res) => {
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

    const { id } = req.params;
    const { status, reason, incrementUsage } = req.body;

    // Find box
    let box = await Box.findById(id);
    if (!box) {
      box = await Box.findOne({ boxId: id.toUpperCase() });
    }

    if (!box) {
      return res.status(404).json({
        success: false,
        message: 'Box not found'
      });
    }

    // Check permissions
    if (req.user.role === 'manufacturer' && box.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this box'
      });
    }

    const previousStatus = box.status;
    const previousUsage = box.usageCount;

    // Update status
    if (status) {
      box.status = status;
      box.lastModifiedBy = req.user._id;

      if (status === 'retired') {
        box.retiredAt = new Date();
        box.retiredReason = reason || 'Manual retirement';
      }
    }

    // Increment usage if requested
    if (incrementUsage) {
      box.usageCount += 1;
    }

    await box.save();

    // Create history entries
    if (status && status !== previousStatus) {
      await BoxHistory.createEntry({
        box: box._id,
        boxId: box.boxId,
        action: 'status_changed',
        performedBy: req.user._id,
        details: reason || `Status changed from ${previousStatus} to ${status}`,
        previousValue: previousStatus,
        newValue: status
      });
    }

    if (incrementUsage) {
      await BoxHistory.createEntry({
        box: box._id,
        boxId: box.boxId,
        action: 'usage_incremented',
        performedBy: req.user._id,
        details: `Usage count incremented from ${previousUsage} to ${box.usageCount}`,
        previousValue: previousUsage,
        newValue: box.usageCount
      });
    }

    res.json({
      success: true,
      message: 'Box updated successfully',
      data: { box }
    });

  } catch (error) {
    console.error('Update box status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during box update'
    });
  }
};

/**
 * @desc    Update box details
 * @route   PUT /api/boxes/:id
 * @access  Private (Manufacturer/Admin)
 */
const updateBox = async (req, res) => {
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

    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.createdBy; // Prevent changing creator
    updateData.lastModifiedBy = req.user._id;

    // Find box
    let box = await Box.findById(id);
    if (!box) {
      box = await Box.findOne({ boxId: id.toUpperCase() });
    }

    if (!box) {
      return res.status(404).json({
        success: false,
        message: 'Box not found'
      });
    }

    // Check permissions
    if (req.user.role === 'manufacturer' && box.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this box'
      });
    }

    const updatedBox = await Box.findByIdAndUpdate(
      box._id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    // Create history entry
    await BoxHistory.createEntry({
      box: updatedBox._id,
      boxId: updatedBox.boxId,
      action: 'notes_updated',
      performedBy: req.user._id,
      details: `Box details updated by ${req.user.name}`
    });

    res.json({
      success: true,
      message: 'Box updated successfully',
      data: { box: updatedBox }
    });

  } catch (error) {
    console.error('Update box error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during box update'
    });
  }
};

/**
 * @desc    Delete box
 * @route   DELETE /api/boxes/:id
 * @access  Private (Admin only)
 */
const deleteBox = async (req, res) => {
  try {
    const { id } = req.params;

    // Find box
    let box = await Box.findById(id);
    if (!box) {
      box = await Box.findOne({ boxId: id.toUpperCase() });
    }

    if (!box) {
      return res.status(404).json({
        success: false,
        message: 'Box not found'
      });
    }

    await Box.findByIdAndDelete(box._id);

    // Create history entry
    await BoxHistory.createEntry({
      box: box._id,
      boxId: box.boxId,
      action: 'retired',
      performedBy: req.user._id,
      details: `Box deleted by ${req.user.name}`
    });

    res.json({
      success: true,
      message: 'Box deleted successfully'
    });

  } catch (error) {
    console.error('Delete box error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during box deletion'
    });
  }
};

module.exports = {
  createBox,
  getBox,
  getBoxes,
  updateBoxStatus,
  updateBox,
  deleteBox
};
