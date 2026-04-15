const DisasterEvent = require("../models/DisasterEvent");
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

    for (const evt of allEvents) {
      // Upsert into MongoDB
      await DisasterEvent.updateOne(
        { eventId: evt.eventId },
        { $set: evt },
        { upsert: true },
      );
      upsertCount++;
    }

    console.log(
      `[Engine] Successfully saved ${upsertCount} combined events to the database.`,
    );
  } catch (error) {
    console.error(
      "[Engine] Error running disaster engine fetch",
      error.message,
    );
  }
}

module.exports = { runDisasterEngine };
