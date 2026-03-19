/**
 * Haversine formula — calculates great-circle distance between two coordinate pairs.
 * Returns distance in kilometres.
 */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Alert radius thresholds (km) per disaster type.
 * If within this radius, the user should be notified.
 */
const ALERT_RADII = {
  rain: 50,
  extreme_temperature: 100,
  flood: 100,
  cyclone: 500,
  earthquake: 300,
  wildfire: 150,
  storm: 300,
  volcano: 200,
  default: 150,
};

function getAlertRadius(disasterType) {
  const key = (disasterType || '').toLowerCase();
  return ALERT_RADII[key] || ALERT_RADII.default;
}

module.exports = { haversine, getAlertRadius };
