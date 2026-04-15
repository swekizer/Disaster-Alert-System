const DisasterEvent = require("../models/DisasterEvent");
const UserPreference = require("../models/UserPreference");
const { sendEmail } = require("./notify");
const { fetchOpenMeteoExtremeWeather } = require("./openMeteo");
const { fetchFirmsActiveFires } = require("./firms");
const { fetchUsgsEarthquakes } = require("./usgs");
const { fetchWaqiAirQuality } = require("./waqi");

const INDIA_BOUNDS = {
  minLat: 6.5,
  maxLat: 37.5,
  minLon: 68.0,
  maxLon: 97.5,
};

function isInIndia(lat, lon) {
  return (
    lat >= INDIA_BOUNDS.minLat &&
    lat <= INDIA_BOUNDS.maxLat &&
    lon >= INDIA_BOUNDS.minLon &&
    lon <= INDIA_BOUNDS.maxLon
  );
}

// Broader region — South/SE Asia useful for cyclones approaching India
function isInRegion(lat, lon) {
  return lat >= -5 && lat <= 45 && lon >= 55 && lon <= 110;
}

function mapMagnitudeToSeverity(mag) {
  if (mag >= 7.0) return "extreme";
  if (mag >= 5.5) return "high";
  if (mag >= 4.0) return "medium";
  return "low";
}

function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// ────────────────────────────────────────────
// Engine: fetch all sources, upsert to MongoDB
// ────────────────────────────────────────────
async function runDisasterEngine() {
  console.log("[Engine] Running scheduled data sync for all sources...");

  try {
    const openMeteoEvents = await fetchOpenMeteoExtremeWeather();
    const firmsEvents = await fetchFirmsActiveFires();
    const usgsEvents = await fetchUsgsEarthquakes();
    const waqiEvents = await fetchWaqiAirQuality();

    const allEvents = [
      ...openMeteoEvents,
      ...firmsEvents,
      ...usgsEvents,
      ...waqiEvents,
    ];
    let upsertCount = 0;
    
    // Fetch users who want emails
    const activeSettings = await UserPreference.find({ emailEnabled: true });
    console.log(`[Engine] Found ${activeSettings.length} user(s) with email alerts enabled.`);

    for (const evt of allEvents) {
      // Upsert into MongoDB
      const result = await DisasterEvent.updateOne(
        { eventId: evt.eventId },
        { $set: evt },
        { upsert: true },
      );
      if (result.upsertedCount > 0) upsertCount++;
    }

    // Notify users: check ALL events, but only email events not yet seen by that user
    const allActiveEvents = await DisasterEvent.find({ active: { $ne: false } });
    
    for (const user of activeSettings) {
      if (!user.lat || !user.lon || !user.email) {
        console.log(`[Engine] Skipping user ${user.email || '(no email)'} — missing lat/lon/email.`);
        continue;
      }

      const newEventIdsForUser = [];

      for (const evt of allActiveEvents) {
        // Skip if user already notified about this event
        if (user.notifiedEventIds.includes(evt.eventId)) continue;

        const dist = getDistanceInKm(user.lat, user.lon, evt.latitude, evt.longitude);
        if (dist <= user.radius) {
          console.log(`[Engine] "${evt.title}" is ${Math.round(dist)}km from ${user.email} — sending email...`);
          const subject = `⚠️ New Alert: ${evt.title}`;
          const text = `A new ${evt.disasterType} event has been detected roughly ${Math.round(dist)}km from your location.\n\nDetails: ${evt.description}\nSeverity: ${evt.severity}\nSource: ${evt.sourceAPI}\n\nStay Safe!`;
          await sendEmail(user.email, subject, text);
          newEventIdsForUser.push(evt.eventId);
        }
      }

      // Update the user's notifiedEventIds so they won't be re-notified
      if (newEventIdsForUser.length > 0) {
        await UserPreference.updateOne(
          { _id: user._id },
          { $addToSet: { notifiedEventIds: { $each: newEventIdsForUser } } }
        );
        console.log(`[Engine] Marked ${newEventIdsForUser.length} event(s) as notified for ${user.email}.`);
      }
    }

    console.log(
      `[Engine] Successfully saved ${upsertCount} new events to the database.`,
    );
  } catch (error) {
    console.error(
      "[Engine] Error running disaster engine fetch",
      error.message,
    );
  }
}

module.exports = { runDisasterEngine };
