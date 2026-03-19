import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAllEvents } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const SEV_COLORS = {
  extreme: '#7C3AED',
  high:    '#DC2626',
  medium:  '#D97706',
  low:     '#16A34A',
};

// Fit map to India bounds on load
function IndiaFit() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([[6.5, 68.0], [37.5, 97.5]], { padding: [10, 10] });
  }, [map]);
  return null;
}

const DISASTER_ICONS = {
  earthquake:    '🌍',
  flood:         '🌊',
  cyclone:       '🌀',
  rain:          '🌧️',
  wildfire:      '🔥',
  storm:         '⛈️',
  volcano:       '🌋',
  weather_alert: '⚠️',
};

export default function MapPage() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetchAllEvents({ limit: 500 })
      .then((d) => setEvents(d.events || []))
      .catch(() => setError('Could not load events.'))
      .finally(() => setLoading(false));
  }, []);

  const validEvents = events.filter(
    (e) => e.latitude != null && e.longitude != null
  );

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>🗺️ Disaster Map</h1>
          <p>All active disaster events plotted across India and the surrounding region.</p>
        </div>
      </div>

      <div className="container page-content">
        {/* Legend */}
        <div className="map-legend">
          <strong>Severity:</strong>
          {Object.entries(SEV_COLORS).map(([k, v]) => (
            <span key={k} className="legend-item">
              <span className="legend-dot" style={{ background: v }} />
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </span>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {validEvents.length} events shown
          </span>
        </div>

        {error && <div className="alert-banner danger" style={{ marginBottom: 12 }}>⚠️ {error}</div>}

        {loading ? (
          <LoadingSpinner text="Loading map data…" />
        ) : (
          <div className="map-container">
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ height: '72vh', width: '100%' }}
              scrollWheelZoom
            >
              <IndiaFit />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
              />
              {validEvents.map((e) => (
                <CircleMarker
                  key={e._id || e.eventId}
                  center={[e.latitude, e.longitude]}
                  radius={e.severity === 'extreme' ? 11 : e.severity === 'high' ? 9 : 7}
                  pathOptions={{
                    color: SEV_COLORS[e.severity] || '#999',
                    fillColor: SEV_COLORS[e.severity] || '#999',
                    fillOpacity: 0.65,
                    weight: 1.5,
                  }}
                >
                  <Tooltip>
                    <strong>
                      {DISASTER_ICONS[e.disasterType] || '⚡'} {e.title}
                    </strong>
                    <br />
                    Severity: {e.severity} | Source: {e.sourceAPI}
                    {e.magnitude != null && <><br />Magnitude: M{e.magnitude}</>}
                    <br />
                    {new Date(e.timestamp).toLocaleDateString('en-IN')}
                  </Tooltip>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
}
