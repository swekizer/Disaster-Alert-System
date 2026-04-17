import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import { useLocation } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { fetchAllEvents } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import GlobeMap from "../components/GlobeMap";

const SEV_COLORS = {
  extreme: "#7C3AED",
  high: "#DC2626",
  medium: "#D97706",
  low: "#16A34A",
};

// Fit map to India bounds on load
function IndiaFit() {
  const map = useMap();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const lat = params.get("lat");
    const lon = params.get("lon") || params.get("lng");
    const zoom = params.get("zoom") || 8;

    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);

    if (lat && lon && !isNaN(parsedLat) && !isNaN(parsedLon)) {
      map.setView([parsedLat, parsedLon], parseInt(zoom, 10) || 8);
    } else {
      map.fitBounds(
        [
          [6.5, 68.0],
          [37.5, 97.5],
        ],
        { padding: [10, 10] },
      );
    }
  }, [map, location.search]);
  return null;
}

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "earthquake", label: "Earthquake" },
  { value: "wildfire", label: "Wildfire" },
  { value: "flood", label: "Flood" },
  { value: "rain", label: "Heavy Rain" },
  { value: "cyclone", label: "Cyclone" },
  { value: "storm", label: "Storm" },
  { value: "heatwave", label: "Heatwave" },
  { value: "coldwave", label: "Coldwave" },
  { value: "snow", label: "Snow" },
  { value: "uv", label: "UV Radiation" },
  { value: "air_quality", label: "Air Quality" },
];

const DISASTER_ICONS = {
  earthquake: "🌍",
  wildfire: "🔥",
  flood: "🌊",
  rain: "🌧️",
  cyclone: "🌀",
  storm: "⛈️",
  heatwave: "🌡️",
  coldwave: "🥶",
  snow: "❄️",
  uv: "☀️",
  air_quality: "😷",
};

export default function MapPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [viewMode, setViewMode] = useState("globe");

  useEffect(() => {
    fetchAllEvents({ limit: 500 })
      .then((d) => setEvents(d.events || []))
      .catch(() => setError("Could not load events."))
      .finally(() => setLoading(false));
  }, []);

  const validEvents = events
    .filter((e) => e.latitude != null && e.longitude != null)
    .filter((e) => (typeFilter ? e.disasterType === typeFilter : true));

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <div>
            <h1>🗺️ Disaster Map</h1>
            <p>Active events across India</p>
          </div>

          {/* Pill type filters */}
          <div className="map-type-filters">
            {TYPE_OPTIONS.map((o) => (
              <button
                key={o.value}
                className={`map-filter-pill${typeFilter === o.value ? ' active' : ''}`}
                onClick={() => setTypeFilter(o.value)}
              >
                {o.value && DISASTER_ICONS[o.value] ? `${DISASTER_ICONS[o.value]} ` : ''}
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container page-content">
        {error && (
          <div className="alert-banner danger" style={{ marginBottom: 12 }}>
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Loading map data…" />
        ) : (
          <>
            {/* View Mode Toggle — outside the map box, right aligned */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <div style={{
                display: 'flex',
                gap: '3px',
                background: '#FFFFFF',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <button
                  onClick={() => setViewMode('map')}
                  style={{
                    padding: '6px 16px',
                    border: 'none',
                    borderRadius: '5px',
                    background: viewMode === 'map' ? '#1E3A5F' : 'transparent',
                    color: viewMode === 'map' ? '#FFFFFF' : '#4B5563',
                    fontWeight: viewMode === 'map' ? '600' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font)',
                  }}
                >🗺️ 2D Map</button>
                <button
                  onClick={() => setViewMode('globe')}
                  style={{
                    padding: '6px 16px',
                    border: 'none',
                    borderRadius: '5px',
                    background: viewMode === 'globe' ? '#1E3A5F' : 'transparent',
                    color: viewMode === 'globe' ? '#FFFFFF' : '#4B5563',
                    fontWeight: viewMode === 'globe' ? '600' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font)',
                  }}
                >🌍 3D Globe</button>
              </div>
            </div>
          <div className="map-container" style={{ height: "72vh" }}>
            {viewMode === "globe" ? (
              <GlobeMap events={validEvents} />
            ) : (
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <MapContainer
                  center={[20.5937, 78.9629]}
                  zoom={5}
                  style={{ height: "100%", width: "100%", borderRadius: "8px" }}
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
                      radius={
                        e.severity === "extreme"
                          ? 11
                          : e.severity === "high"
                            ? 9
                            : 7
                      }
                      pathOptions={{
                        color: SEV_COLORS[e.severity] || "#999",
                        fillColor: SEV_COLORS[e.severity] || "#999",
                        fillOpacity: 0.65,
                        weight: 1.5,
                      }}
                    >
                      <Tooltip>
                        <strong>
                          {DISASTER_ICONS[e.disasterType] || "⚡"} {e.title}
                        </strong>
                        <br />
                        Severity: {e.severity} | Source: {e.sourceAPI}
                        {e.magnitude != null && (
                          <>
                            <br />
                            Magnitude: M{e.magnitude}
                          </>
                        )}
                        <br />
                        {new Date(e.timestamp).toLocaleDateString("en-IN")}
                      </Tooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>
                {/* Severity legend overlay — matches GlobeMap style */}
                <div style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  background: 'rgba(10,22,40,0.82)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'flex',
                  gap: '12px',
                  fontSize: '12px',
                  color: 'white',
                  pointerEvents: 'none',
                  backdropFilter: 'blur(4px)',
                  zIndex: 1000,
                }}>
                  {Object.entries(SEV_COLORS).map(([k, v]) => (
                    <span key={k} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: v, display: 'inline-block' }} />
                      {k.charAt(0).toUpperCase() + k.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
