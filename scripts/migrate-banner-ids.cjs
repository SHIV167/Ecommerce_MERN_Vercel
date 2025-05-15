// Migration script to add 'id' field to all banners missing it
// Usage: node scripts/migrate-banner-ids.cjs

const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  id: { type: String, unique: true, sparse: true },
  title: String,
  subtitle: String,
  desktopImageUrl: String,
  mobileImageUrl: String,
  alt: String,
  linkUrl: String,
  enabled: Boolean,
  position: Number
}, { collection: 'banners' });

const Banner = mongoose.model('Banner', bannerSchema);

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
