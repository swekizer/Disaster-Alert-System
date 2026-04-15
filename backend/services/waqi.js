const axios = require('axios');

const WAQI_TOKEN = process.env.WAQI_TOKEN;
// Coordinates for roughly South Asia (minLat, minLon, maxLat, maxLon)
const BOUNDS = '-5,55,45,110';

function mapAqiToSeverity(aqi) {
  if (aqi > 300) return 'extreme'; // Hazardous
  if (aqi > 200) return 'high';    // Very Unhealthy
  if (aqi > 150) return 'medium';  // Unhealthy
  return 'low';
}

/**
 * Fetches Air Quality data for the region from WAQI.
 * Only returns stations exceeding AQI 150 (Unhealthy).
 */
async function fetchWaqiAirQuality() {
  if (!WAQI_TOKEN) {
    console.warn('[WAQI] WAQI_TOKEN missing in .env. Skipping air quality fetch.');
    return [];
  }

  console.log('[WAQI] Fetching air quality data for South Asia...');
  const url = `https://api.waqi.info/map/bounds/?latlng=${BOUNDS}&token=${WAQI_TOKEN}`;

  try {
    const response = await axios.get(url);
    const result = response.data;

    if (result.status !== 'ok' || !result.data) {
      console.warn('[WAQI] Invalid response from WAQI API:', result);
      return [];
    }

    const events = [];

    result.data.forEach(stationData => {
      const { lat, lon, uid, aqi, station } = stationData;
      
      // The map bounds API sometimes returns string '-' for unknown AQI
      const parsedAqi = parseInt(aqi, 10);

      // We only want alerts for Unhealthy or worse (> 150)
      if (!isNaN(parsedAqi) && parsedAqi > 150) {
        // Construct the timestamp using the station's reported time if available, or now
        let timestamp = new Date();
        if (station && station.time) {
          timestamp = new Date(station.time);
        }

        events.push({
          eventId: `waqi-${uid}`,
          disasterType: 'air_quality',
          title: `Severe Air Pollution: ${station.name || 'Unknown Station'}`,
          description: `Air Quality Index (AQI) is at dangerous levels: ${parsedAqi}. Limit outdoor exertion.`,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          severity: mapAqiToSeverity(parsedAqi),
          magnitude: parsedAqi, // Storing AQI as magnitude
          sourceAPI: 'waqi',
          externalUrl: `https://aqicn.org/city/${uid}/`,
          timestamp: timestamp,
          active: true
        });
      }
    });

    console.log(`[WAQI] Successfully fetched ${result.data.length} stations.`);
    console.log(`[WAQI] Filtered down to ${events.length} stations with AQI > 150.`);
    
    return events;

  } catch (error) {
    console.error('[WAQI] Error fetching WAQI API:', error.message);
    return [];
  }
}

module.exports = {
  fetchWaqiAirQuality
};
