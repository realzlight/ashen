import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB\n');

    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('No users found');
    } else {
      console.table(users.map(u => ({
        _id: u._id.toString(),
        githubId: u.githubId,
        username: u.username,
        email: u.email,
      })));
      console.log(`\nTotal: ${users.length} users`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
