const mongoose = require('mongoose');
const Address = require('../models/Address');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for migration');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migration function to add state field to existing addresses
const migrateAddresses = async () => {
  try {
    console.log('Starting address migration...');
    
    // Find all addresses that don't have a state field
    const addressesWithoutState = await Address.find({
      $or: [
        { state: { $exists: false } },
        { state: null },
        { state: '' }
      ]
    });

    console.log(`Found ${addressesWithoutState.length} addresses without state field`);

    if (addressesWithoutState.length === 0) {
      console.log('No addresses need migration');
      return;
    }

    // Update addresses to add empty state field
    // Users will need to edit their addresses to add the state
    const updateResult = await Address.updateMany(
      {
        $or: [
          { state: { $exists: false } },
          { state: null },
          { state: '' }
        ]
      },
      {
        $set: { state: '' }
      }
    );

    console.log(`Migration completed. Updated ${updateResult.modifiedCount} addresses`);
    console.log('Note: Users will need to edit their existing addresses to add state information');

  } catch (error) {
    console.error('Migration error:', error);
  }
};

// Run migration
const runMigration = async () => {
  await connectDB();
  await migrateAddresses();
  await mongoose.connection.close();
  console.log('Migration completed and database connection closed');
  process.exit(0);
};

// Execute if run directly
if (require.main === module) {
  runMigration();
}

module.exports = { migrateAddresses };
