const express = require('express');
const router = express.Router();
const UserPreference = require('../models/UserPreference');
const { getAuth } = require('@clerk/express');

// GET /api/preferences
// Returns the currently authenticated user's preferences
router.get('/', async (req, res) => {
  try {
    const auth = getAuth(req);
    const clerkId = auth.userId;
    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let prefs = await UserPreference.findOne({ clerkId });
    if (!prefs) {
      // Return a default object if none exists yet
      prefs = {
        email: '',
        emailEnabled: false,
        lat: null,
        lon: null,
        radius: 50
      };
    }

    res.json(prefs);
  } catch (err) {
    console.error('Error fetching preferences:', err);
    res.status(500).json({ error: 'Server error fetching preferences.' });
  }
});

// PUT /api/preferences
// Updates or creates preferences for the authenticated user
router.put('/', async (req, res) => {
  try {
    const auth = getAuth(req);
    const clerkId = auth.userId;
    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { email, emailEnabled, lat, lon, radius } = req.body;

    const updated = await UserPreference.findOneAndUpdate(
      { clerkId },
      {
        $set: {
          email,
          emailEnabled,
          lat,
          lon,
          radius
        }
      },
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (err) {
    console.error('Error saving preferences:', err);
    res.status(500).json({ error: 'Server error saving preferences.' });
  }
});

module.exports = router;
