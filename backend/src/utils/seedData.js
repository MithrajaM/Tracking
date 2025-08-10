const User = require('../models/User');
const Box = require('../models/Box');
const Delivery = require('../models/Delivery');
const BoxHistory = require('../models/BoxHistory');

/**
 * Seed initial data for development and testing
 */
const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Box.deleteMany({}),
      Delivery.deleteMany({}),
      BoxHistory.deleteMany({})
    ]);

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@tracktrack.com',
      password: 'Admin123!',
      role: 'admin'
    });

    // Create manufacturer user
    const manufacturerUser = await User.create({
      name: 'Manufacturer User',
      email: 'manufacturer@tracktrack.com',
      password: 'Manufacturer123!',
      role: 'manufacturer',
      createdBy: adminUser._id
    });

    // Create end user
    const endUser = await User.create({
      name: 'Delivery Agent',
      email: 'agent@tracktrack.com',
      password: 'Agent123!',
      role: 'end-user',
      createdBy: adminUser._id
    });

    console.log('✅ Users created');

    // Create sample boxes
    const boxes = await Box.create([
      {
        boxId: 'BOX001',
        manufacturer: 'EcoBox Ltd.',
        status: 'in-use',
        usageCount: 5,
        maxUsage: 20,
        currentLocation: 'Warehouse A',
        material: 'Recycled Cardboard',
        createdBy: manufacturerUser._id,
        dimensions: {
          length: 30,
          width: 20,
          height: 15,
          unit: 'cm'
        },
        weight: {
          value: 0.5,
          unit: 'kg'
        }
      },
      {
        boxId: 'BOX002',
        manufacturer: 'GreenPack Co.',
        status: 'new',
        usageCount: 0,
        maxUsage: 25,
        currentLocation: 'Distribution Center',
        material: 'Biodegradable Plastic',
        createdBy: manufacturerUser._id,
        dimensions: {
          length: 25,
          width: 25,
          height: 10,
          unit: 'cm'
        },
        weight: {
          value: 0.3,
          unit: 'kg'
        }
      },
      {
        boxId: 'BOX003',
        manufacturer: 'EcoBox Ltd.',
        status: 'retired',
        usageCount: 20,
        maxUsage: 20,
        currentLocation: 'Recycling Center',
        material: 'Recycled Cardboard',
        createdBy: manufacturerUser._id,
        retiredAt: new Date(),
        retiredReason: 'Maximum usage reached'
      },
      {
        boxId: 'BOX004',
        manufacturer: 'SustainBox Inc.',
        status: 'in-use',
        usageCount: 18,
        maxUsage: 20,
        currentLocation: 'Warehouse B',
        material: 'Bamboo Fiber',
        createdBy: manufacturerUser._id
      },
      {
        boxId: 'BOX005',
        manufacturer: 'GreenPack Co.',
        status: 'damaged',
        usageCount: 8,
        maxUsage: 25,
        currentLocation: 'Repair Center',
        material: 'Biodegradable Plastic',
        createdBy: manufacturerUser._id
      }
    ]);

    console.log('✅ Boxes created');

    // Create sample deliveries
    const deliveries = await Delivery.create([
      {
        boxId: 'BOX001',
        box: boxes[0]._id,
        deliveredBy: endUser._id,
        deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        deliveryLocation: {
          address: '123 Main St, Anytown, CA 12345',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194
          }
        },
        recipient: {
          name: 'John Doe',
          phone: '+1-555-0123',
          email: 'john.doe@email.com'
        },
        deliveryStatus: 'delivered',
        packageCondition: 'excellent',
        notes: 'Package delivered successfully to front door'
      },
      {
        boxId: 'BOX002',
        box: boxes[1]._id,
        deliveredBy: endUser._id,
        deliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        deliveryLocation: {
          address: '456 Oak Ave, Springfield, IL 62701',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701'
        },
        recipient: {
          name: 'Jane Smith',
          phone: '+1-555-0456'
        },
        deliveryStatus: 'delivered',
        packageCondition: 'good'
      },
      {
        boxId: 'BOX001',
        box: boxes[0]._id,
        deliveredBy: endUser._id,
        deliveryDate: new Date(), // Today
        deliveryLocation: {
          address: '789 Pine St, Portland, OR 97201',
          city: 'Portland',
          state: 'OR',
          zipCode: '97201'
        },
        recipient: {
          name: 'Bob Johnson',
          email: 'bob.johnson@email.com'
        },
        deliveryStatus: 'delivered',
        packageCondition: 'excellent',
        notes: 'Left with neighbor as requested'
      }
    ]);

    console.log('✅ Deliveries created');

    // Create box history entries
    for (const box of boxes) {
      await BoxHistory.createEntry({
        box: box._id,
        boxId: box.boxId,
        action: 'created',
        performedBy: manufacturerUser._id,
        details: `Box created by ${manufacturerUser.name}`
      });
    }

    for (const delivery of deliveries) {
      await BoxHistory.createEntry({
        box: delivery.box,
        boxId: delivery.boxId,
        action: 'delivered',
        performedBy: delivery.deliveredBy,
        details: `Box delivered to ${delivery.recipient.name}`,
        relatedDelivery: delivery._id
      });
    }

    console.log('✅ Box history created');
    console.log('🎉 Data seeding completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@tracktrack.com / Admin123!');
    console.log('Manufacturer: manufacturer@tracktrack.com / Manufacturer123!');
    console.log('Agent: agent@tracktrack.com / Agent123!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

module.exports = { seedData };
