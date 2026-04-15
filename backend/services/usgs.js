const axios = require('axios');

// Broader region — South/SE Asia useful for our focus
function isInRegion(lat, lon) {
  return lat >= -5 && lat <= 45 && lon >= 55 && lon <= 110;
}

function mapMagnitudeToSeverity(mag) {
  if (mag >= 7.0) return 'extreme';
  if (mag >= 5.5) return 'high';
  if (mag >= 4.0) return 'medium';
  return 'low';
}

/**
 * Fetches all earthquakes from the past day from USGS
 * and filters them down to our focus region (South Asia).
 */
async function fetchUsgsEarthquakes() {
  console.log('[USGS] Fetching recent earthquakes...');
  const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

  try {
    const response = await axios.get(url);
    const data = response.data;
    
    if (!data || !data.features) {
       return [];
    }

    const events = [];

    data.features.forEach(feature => {
      const { id, properties, geometry } = feature;
      const { mag, title, url: externalUrl, time } = properties;
      
      const lon = geometry.coordinates[0];
      const lat = geometry.coordinates[1];

      // Filter for South Asia
      if (isInRegion(lat, lon) && mag !== null && mag > 0) {
        events.push({
          eventId: `usgs-${id}`,
          disasterType: 'earthquake',
          title: title,
          description: `An earthquake of magnitude ${mag} occurred at ${new Date(time).toUTCString()}.`,
          latitude: lat,
          longitude: lon,
          severity: mapMagnitudeToSeverity(mag),
          magnitude: mag,
          sourceAPI: 'usgs',
          externalUrl: externalUrl,
          timestamp: new Date(time),
          active: true // Recent earthquake
        });
      }
    });

    console.log(`[USGS] Successfully fetched ${data.features.length} global earthquakes.`);
    console.log(`[USGS] Filtered down to ${events.length} within the South Asia focus region.`);
    
    return events;

  } catch (error) {
    console.error('[USGS] Error fetching USGS API:', error.message);
    return [];
  }
}

module.exports = {
  fetchUsgsEarthquakes
};
