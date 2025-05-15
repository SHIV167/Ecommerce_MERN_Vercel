// Migration script to add 'id' field to all banners missing it
// Usage: node scripts/migrate-banner-ids.js

const mongoose = require('mongoose');
const path = require('path');

// Adjust the path as needed based on your project structure
const Banner = require(path.resolve(__dirname, '../server/models/Banner')).default;

async function migrate() {
  // TODO: Update this with your actual MongoDB connection string
  const mongoUri = 'mongodb://localhost:27017/newecom';
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

  const banners = await Banner.find({ $or: [ { id: { $exists: false } }, { id: null } ] });
  if (!banners.length) {
    console.log('No banners need migration.');
    await mongoose.disconnect();
    return;
  }

  for (const banner of banners) {
    banner.id = banner._id.toString();
    await banner.save();
    console.log(`Migrated banner _id=${banner._id} to id=${banner.id}`);
  }
  console.log(`Migration complete. Total migrated: ${banners.length}`);
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  mongoose.disconnect();
});
