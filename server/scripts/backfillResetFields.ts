import dotenv from 'dotenv';
dotenv.config();

import { connectToDatabase, closeDatabaseConnection } from '../db';
import UserModel from '../models/User';

(async () => {
  const conn = await connectToDatabase();
  if (!conn) {
    console.error('Migration aborted: could not connect to MongoDB');
    process.exit(1);
  }

  try {
    const result = await UserModel.updateMany(
      { resetPasswordToken: { $exists: false } },
      { $set: { resetPasswordToken: null, resetPasswordExpire: null } }
    );
    console.log(`🛠  Modified ${result.modifiedCount} user(s)`);
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await closeDatabaseConnection();
    process.exit(0);
  }
})();
