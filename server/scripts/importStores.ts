import 'dotenv/config';
import mongoose from 'mongoose';
import Store from '../models/Store';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Support both MONGODB_URI and MONGODB_URL for compatibility
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://localhost:27017/ecommerce';
console.log("Connecting to MongoDB at:", MONGODB_URI);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SAMPLE_PATH = path.join(__dirname, '../sample-data/stores.json');

async function importStores() {
  try {
    await mongoose.connect(MONGODB_URI);
    const stores = JSON.parse(fs.readFileSync(SAMPLE_PATH, 'utf-8'));
    await Store.deleteMany({});
    await Store.insertMany(stores);
    console.log(`Imported ${stores.length} stores.`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to import stores:', err);
    process.exit(1);
  }
}

importStores();
