const axios = require('axios');
const { parse } = require('csv-parse/sync');

const MAP_KEY = process.env.FIRMS_MAP_KEY;
const INDIA_BBOX = '68.0,6.5,97.5,37.5'; // min_lon,min_lat,max_lon,max_lat
const SOURCE = 'VIIRS_SNPP_NRT';
const DAYS = 1;

/**
 * Fetches active fire anomalies from NASA FIRMS and returns them as an array of DisasterEvent shapes.
 */
async function fetchFirmsActiveFires() {
  if (!MAP_KEY) {
    console.warn('[FIRMS] FIRMS_MAP_KEY missing. Skipping NASA FIRMS fetch.');
    return [];
  }

  console.log('[FIRMS] Fetching active thermal anomalies (NASA VIIRS) for India...');
  
  // Example URL: https://firms.modaps.eosdis.nasa.gov/api/area/csv/[key]/VIIRS_SNPP_NRT/68,6.5,97.5,37.5/1
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${MAP_KEY}/${SOURCE}/${INDIA_BBOX}/${DAYS}`;

  try {
    const response = await axios.get(url);
    const csvString = response.data;
    
    // FIRMS returns plain text CSV. Parse it into an array of JS objects
    const records = parse(csvString, {
      columns: true,
      skip_empty_lines: true
    });

    const activeFires = [];

    // Filter and map CSV rows to our standard Database schema
    records.forEach(row => {
      // VIIRS mapping specifics:
      // confidence: 'l' (low), 'n' (nominal), 'h' (high)
      // frp: Fire Radiative Power (MW)
      // acq_date: 'YYYY-MM-DD'
      // acq_time: 'HHMM'

      const confidence = row.confidence;
      const frp = parseFloat(row.frp);
      const lat = parseFloat(row.latitude);
      const lon = parseFloat(row.longitude);

      // Rule Engine: Only trigger alerts for NOMINAL or HIGH confidence fires 
      // with significant thermal energy (FRP > 15) to filter out small garbage/farm fires.
      if ((confidence === 'n' || confidence === 'h') && frp > 15.0) {
        
        let severity = 'medium';
        if (confidence === 'h' && frp > 100) severity = 'extreme';
        else if (frp > 50) severity = 'high';

        // Construct a JS Date out of the NASA acquired time strings
        const timeStr = row.acq_time.padStart(4, '0'); // '0821'
        const hours = timeStr.substring(0, 2);
        const mins = timeStr.substring(2, 4);
        const timestamp = new Date(`${row.acq_date}T${hours}:${mins}:00.000Z`);

        // Generate unique ID based on location and date
        const eventId = `firms-${row.acq_date}-${row.acq_time}-${lat.toFixed(4)}-${lon.toFixed(4)}`;

        activeFires.push({
          eventId,
          disasterType: 'wildfire',
          title: severity === 'extreme' ? 'Extreme Wildfire Alert' : 'Active Wildfire Detected',
          description: `Satellite detected a severe thermal anomaly with ${frp.toFixed(1)} MW radiative power.`,
          latitude: lat,
          longitude: lon,
          severity: severity,
          sourceAPI: 'firms',
          externalUrl: 'https://firms.modaps.eosdis.nasa.gov/map/',
          timestamp: timestamp,
          active: true // Recent fire from today
        });
      }
    });

    console.log(`[FIRMS] Successfully parsed ${records.length} raw thermal anomalies.`);
    console.log(`[FIRMS] Filtered down to ${activeFires.length} significant wildfire alerts.`);
    return activeFires;

  } catch (error) {
    console.error('[FIRMS] Error fetching FIRMS API:', error.message);
    return [];
  }
}

module.exports = {
  fetchFirmsActiveFires
};
