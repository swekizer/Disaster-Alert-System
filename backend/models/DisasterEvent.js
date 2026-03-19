const mongoose = require('mongoose');

const disasterEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  disasterType: { type: String, required: true }, // earthquake, flood, cyclone, rain, wildfire, storm, etc.
  title: { type: String, required: true },
  description: { type: String, default: '' },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'extreme'], default: 'medium' },
  magnitude: { type: Number, default: null }, // for earthquakes
  sourceAPI: { type: String, required: true }, // usgs, eonet, openweather, gdacs
  externalUrl: { type: String, default: '' },
  timestamp: { type: Date, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

// Index for geospatial-style queries (lat/lon range)
disasterEventSchema.index({ latitude: 1, longitude: 1 });
disasterEventSchema.index({ timestamp: -1 });

module.exports = mongoose.model('DisasterEvent', disasterEventSchema);
