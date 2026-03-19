const axios = require('axios');
const DisasterEvent = require('../models/DisasterEvent');

// We will monitor a rough grid covering major parts of India to simulate a nationwide check.
// In a full production app, this would be a much denser grid or triggered by user queries.
// Points: Delhi(North), Mumbai(West), Chennai(South), Kolkata(East), Nagpur(Central), Guwahati(NE), Srinagar(Himalayas)
const INDIA_MONITORING_POINTS = [
  // North
  { lat: 34.08, lon: 74.79, name: 'Srinagar' },
  { lat: 32.72, lon: 74.85, name: 'Jammu' },
  { lat: 31.10, lon: 77.17, name: 'Shimla' },
  { lat: 30.31, lon: 78.03, name: 'Dehradun' },
  { lat: 30.90, lon: 75.85, name: 'Ludhiana' },
  { lat: 28.61, lon: 77.20, name: 'Delhi' },
  { lat: 26.84, lon: 80.94, name: 'Lucknow' },
  { lat: 25.59, lon: 85.13, name: 'Patna' },
  // West
  { lat: 26.91, lon: 75.78, name: 'Jaipur' },
  { lat: 26.23, lon: 73.02, name: 'Jodhpur' },
  { lat: 23.02, lon: 72.57, name: 'Ahmedabad' },
  { lat: 22.30, lon: 70.80, name: 'Rajkot' },
  { lat: 21.17, lon: 72.83, name: 'Surat' },
  { lat: 19.07, lon: 72.87, name: 'Mumbai' },
  { lat: 18.52, lon: 73.85, name: 'Pune' },
  // Central
  { lat: 23.25, lon: 77.41, name: 'Bhopal' },
  { lat: 22.71, lon: 75.85, name: 'Indore' },
  { lat: 21.14, lon: 79.08, name: 'Nagpur' },
  { lat: 21.25, lon: 81.62, name: 'Raipur' },
  // East
  { lat: 22.57, lon: 88.36, name: 'Kolkata' },
  { lat: 23.34, lon: 85.30, name: 'Ranchi' },
  { lat: 20.29, lon: 85.82, name: 'Bhubaneswar' },
  { lat: 19.81, lon: 85.83, name: 'Puri' },
  // North-East
  { lat: 26.14, lon: 91.73, name: 'Guwahati' },
  { lat: 25.57, lon: 91.88, name: 'Shillong' },
  { lat: 27.33, lon: 88.61, name: 'Gangtok' },
  { lat: 27.47, lon: 94.91, name: 'Dibrugarh' },
  { lat: 23.83, lon: 91.28, name: 'Agartala' },
  { lat: 24.81, lon: 93.93, name: 'Imphal' },
  { lat: 23.72, lon: 92.71, name: 'Aizawl' },
  // South
  { lat: 17.38, lon: 78.48, name: 'Hyderabad' },
  { lat: 16.50, lon: 80.64, name: 'Vijayawada' },
  { lat: 15.31, lon: 75.71, name: 'Hubli' },
  { lat: 12.97, lon: 77.59, name: 'Bengaluru' },
  { lat: 13.08, lon: 80.27, name: 'Chennai' },
  { lat: 11.01, lon: 76.95, name: 'Coimbatore' },
  { lat: 9.93,  lon: 76.26, name: 'Kochi' },
  { lat: 8.52,  lon: 76.93, name: 'Thiruvananthapuram' },
  { lat: 9.92,  lon: 78.11, name: 'Madurai' },
  // Islands
  { lat: 11.67, lon: 92.73, name: 'Port Blair' },
  { lat: 10.56, lon: 72.64, name: 'Kavaratti' }
];

/**
 * Parses raw daily forecast data from Open-Meteo and extracts extreme events based on harsh thresholds.
 */
function analyzeExtremeWeather(lat, lon, dailyData) {
  const events = [];
  const { 
    time, 
    precipitation_sum, 
    snowfall_sum, 
    wind_gusts_10m_max, 
    temperature_2m_max, 
    temperature_2m_min, 
    uv_index_max, 
    weather_code 
  } = dailyData;

  // We only look at 'today' and maybe 'tomorrow' to generate current localized alerts.
  // The daily array contains strings like '2023-10-25'. We'll check the first 2 days.
  for (let i = 0; i < 2; i++) {
    if (!time[i]) continue;
    const dateStr = time[i];
    const timestamp = new Date(dateStr);

    // 1. Heavy Rain / Flood Risk
    const precip = precipitation_sum[i];
    if (precip > 100) {
      events.push(createEvent(lat, lon, 'flood', 'Extreme Heavy Rainfall Expected', `Over ${precip}mm of rain expected. High risk of severe flooding.`, 'extreme', dateStr, timestamp));
    } else if (precip > 50) {
      events.push(createEvent(lat, lon, 'rain', 'Heavy Rainfall Warning', `Expected rainfall of ${precip}mm. Potential for localized waterlogging.`, 'high', dateStr, timestamp));
    }

    // 2. Heavy Snow
    const snow = snowfall_sum[i];
    if (snow > 30) {
      events.push(createEvent(lat, lon, 'snow', 'Severe Blizzard / Heavy Snow', `Over ${snow}cm of snow expected. Travel highly discouraged.`, 'extreme', dateStr, timestamp));
    }

    // 3. Heatwave
    const tempMax = temperature_2m_max[i];
    if (tempMax > 42) {
      events.push(createEvent(lat, lon, 'heatwave', 'Severe Heatwave Alert', `Maximum temperature expected to cross ${tempMax}°C. Extremely dangerous conditions.`, 'extreme', dateStr, timestamp));
    } else if (tempMax > 40) {
      events.push(createEvent(lat, lon, 'heatwave', 'Heatwave Warning', `Maximum temperature expected to reach ${tempMax}°C. Unsafe to be outdoors during peak hours.`, 'high', dateStr, timestamp));
    }

    // 4. Coldwave
    const tempMin = temperature_2m_min[i];
    if (tempMin < 2) {
      events.push(createEvent(lat, lon, 'coldwave', 'Severe Coldwave Alert', `Minimum temperature dropping to ${tempMin}°C. High risk of frostbite and hypothermia.`, 'extreme', dateStr, timestamp));
    } else if (tempMin < 5) {
      events.push(createEvent(lat, lon, 'coldwave', 'Coldwave Warning', `Minimum temperature expected to drop to ${tempMin}°C.`, 'high', dateStr, timestamp));
    }

    // 5. Extreme UV
    const uv = uv_index_max[i];
    if (uv >= 11) {
      events.push(createEvent(lat, lon, 'uv', 'Extreme UV Radiation', `UV Index of ${uv} expected. Avoid sun exposure completely.`, 'high', dateStr, timestamp));
    }

    // 6. Storms / Cyclones
    const wind = wind_gusts_10m_max[i];
    if (wind > 90) {
      events.push(createEvent(lat, lon, 'cyclone', 'Destructive Wind Alert', `Wind gusts up to ${wind} km/h expected. High risk of structural damage.`, 'extreme', dateStr, timestamp));
    } else if (wind > 70) {
      events.push(createEvent(lat, lon, 'storm', 'Severe Storm Warning', `Wind gusts up to ${wind} km/h expected. Stay indoors.`, 'high', dateStr, timestamp));
    }

    // 7. Severe Weather Codes (WMO)
    // 95: Thunderstorm, 96/99: Thunderstorm with severe hail
    const code = weather_code[i];
    if (code === 96 || code === 99) {
      events.push(createEvent(lat, lon, 'storm', 'Severe Thunderstorm & Hail', `Violent thunderstorms with heavy hail expected.`, 'extreme', dateStr, timestamp));
    } else if (code === 95) {
      events.push(createEvent(lat, lon, 'storm', 'Thunderstorm Warning', `Strong thunderstorms expected.`, 'high', dateStr, timestamp));
    }
  }

  return events;
}

function createEvent(lat, lon, type, title, description, severity, dateStr, timestamp) {
  // Generate a unique ID for this specific event at this specific location/day
  const eventId = `openmeteo-${type}-${dateStr}-${lat}-${lon}`;
  
  return {
    eventId,
    disasterType: type,
    title,
    description,
    latitude: lat,
    longitude: lon,
    severity,
    sourceAPI: 'openmeteo',
    externalUrl: `https://open-meteo.com/en/forecast?lat=${lat}&lon=${lon}`,
    timestamp,
    active: true // Future forecast, currently active warning
  };
}

/**
 * Fetches extreme weather data for a dense grid across India from Open-Meteo.
 * Uses batching to allow fetching many locations efficiently safely.
 */
async function fetchOpenMeteoExtremeWeather() {
  console.log('[Open-Meteo] Fetching extreme weather forecasts for dense grid in India...');
  let allExtremeEvents = [];

  // Batch into groups to keep URL length safe and reduce API calls.
  // Open-Meteo allows many coordinates, but grouping by 15-20 is safer
  const BATCH_SIZE = 15;
  for (let i = 0; i < INDIA_MONITORING_POINTS.length; i += BATCH_SIZE) {
    const batch = INDIA_MONITORING_POINTS.slice(i, i + BATCH_SIZE);
    
    const lats = batch.map(p => p.lat).join(',');
    const lons = batch.map(p => p.lon).join(',');

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum,snowfall_sum,wind_gusts_10m_max&timezone=auto&forecast_days=3`;
      
      const response = await axios.get(url);
      
      // If we ask for multiple points, Open-Meteo returns an array.
      // If the batch happens to have 1 point, it returns a single object.
      const results = Array.isArray(response.data) ? response.data : [response.data];

      results.forEach((data, index) => {
        if (data && data.daily) {
          const point = batch[index];
          const events = analyzeExtremeWeather(point.lat, point.lon, data.daily);
          allExtremeEvents = allExtremeEvents.concat(events);
        }
      });
      
    } catch (error) {
      console.error(`[Open-Meteo] Error fetching batch starting at index ${i}:`, error.message);
    }
  }

  console.log(`[Open-Meteo] Processed dense grid. Found ${allExtremeEvents.length} severe alerts.`);
  return allExtremeEvents;
}

module.exports = {
  fetchOpenMeteoExtremeWeather
};
