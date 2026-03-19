require('dotenv').config();
const mongoose = require('mongoose');
const DisasterEvent = require('./models/DisasterEvent');

async function clearDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const res = await DisasterEvent.deleteMany({});
    console.log(`[DB] Deleted ${res.deletedCount} events.`);
  } catch (err) {
    console.error('[DB] Error clearing data:', err);
  } finally {
    process.exit(0);
  }
}

clearDB();
