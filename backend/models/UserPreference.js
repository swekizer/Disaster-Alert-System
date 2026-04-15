const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, default: '' },
  emailEnabled: { type: Boolean, default: false },
  lat: { type: Number, default: null },
  lon: { type: Number, default: null },
  radius: { type: Number, default: 50 }, // measured in km
  notifiedEventIds: { type: [String], default: [] }, // tracks which events this user has been emailed about
}, { timestamps: true });

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
