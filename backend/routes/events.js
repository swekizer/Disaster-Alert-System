const express = require('express');
const router = express.Router();
const DisasterEvent = require('../models/DisasterEvent');
const { haversine, getAlertRadius } = require('../utils/haversine');

/**
 * GET /api/events
 * Returns all active disaster events (most recent 7 days).
 * Optional query: ?type=earthquake&severity=high&limit=100
 */
router.get('/', async (req, res) => {
  try {
    const { type, severity, limit = 200 } = req.query;
    // Use $ne: false so documents without the 'active' field are still returned
    const filter = { active: { $ne: false } };
    if (type) filter.disasterType = type;
    if (severity) filter.severity = severity;

    const events = await DisasterEvent.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit, 10));

    res.json({ success: true, count: events.length, events });
  } catch (err) {
    console.error('[Route /events] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});


/**
 * GET /api/events/stats
 * Returns aggregate counts per disaster type and severity.
 */
router.get('/stats', async (req, res) => {
  try {
    const activeFilter = { active: { $ne: false } };
    const byType = await DisasterEvent.aggregate([
      { $match: activeFilter },
      { $group: { _id: '$disasterType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const bySeverity = await DisasterEvent.aggregate([
      { $match: activeFilter },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);

    const total = await DisasterEvent.countDocuments(activeFilter);

    res.json({ success: true, total, byType, bySeverity });
  } catch (err) {
    console.error('[Route /stats] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/events/nearby?lat=&lon=&radius=
 * Returns events within a given radius (km) of the given coordinates.
 * If radius not provided, uses per-type default radius.
 */
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lon, radius } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, error: 'lat and lon are required' });
    }

    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);

    const events = await DisasterEvent.find({ active: { $ne: false } }).sort({ timestamp: -1 }).limit(500);

    const nearby = events
      .map((event) => {
        const dist = haversine(userLat, userLon, event.latitude, event.longitude);
        const alertRadius = radius ? parseFloat(radius) : getAlertRadius(event.disasterType);
        return { event, distance: Math.round(dist), alertRadius };
      })
      .filter(({ distance, alertRadius }) => distance <= alertRadius)
      .sort((a, b) => a.distance - b.distance);

    const results = nearby.map(({ event, distance, alertRadius }) => ({
      ...event.toObject(),
      distanceKm: distance,
      alertRadiusKm: alertRadius,
    }));

    res.json({ success: true, count: results.length, events: results });
  } catch (err) {
    console.error('[Route /nearby] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/events
 * Clears all disaster events from the database.
 */
router.delete('/', async (req, res) => {
  try {
    await DisasterEvent.deleteMany({});
    res.json({ success: true, message: 'All alerts cleared successfully' });
  } catch (err) {
    console.error('[Route DELETE /] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
