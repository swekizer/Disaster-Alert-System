require('dotenv').config();
const mongoose = require('mongoose');
const UserPreference = require('./models/UserPreference');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const res = await UserPreference.findOneAndUpdate(
      { clerkId: 'test' },
      { $set: { email: 'a@b.com', emailEnabled: true, lat: 23, lon: 72, radius: 10 } },
      { new: true, upsert: true }
    );
    console.log('Success:', res);
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}
test();
