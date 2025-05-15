// Migration script to add 'id' field to all banners missing it
// Usage: node scripts/migrate-banner-ids.mjs

import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Emulate __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Banner model (adjust extension if needed)
import BannerModule from '../server/models/Banner.js'; // If you use .ts, change to .ts and ensure ts-node/esm is set up
const Banner = BannerModule.default;

async function migrate() {
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
