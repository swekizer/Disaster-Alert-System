import { useState, useMemo, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const SEV_COLORS = {
  extreme: '#7C3AED',
  high:    '#DC2626',
  medium:  '#D97706',
  low:     '#16A34A',
};

const DISASTER_ICONS = {
  earthquake:  '🌍',
  wildfire:    '🔥',
  flood:       '🌊',
  rain:        '🌧️',
  cyclone:     '🌀',
  storm:       '⛈️',
  heatwave:    '🌡️',
  coldwave:    '🥶',
  snow:        '❄️',
  uv:          '☀️',
  air_quality: '😷',
};

// GeoJSON source layer style for the clustered circles
const clusterLayer = {
  id: 'clusters',
  type: 'circle',
  source: 'events',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': ['step', ['get', 'point_count'], '#60a5fa', 10, '#f59e0b', 30, '#dc2626'],
    'circle-radius': ['step', ['get', 'point_count'], 14, 10, 20, 30, 28],
    'circle-opacity': 0.85,
  },
};

const clusterCountLayer = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'events',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['Noto Sans Regular'],
    'text-size': 13,
  },
  paint: {
    'text-color': '#ffffff',
  },
};

const unclusteredPointLayer = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'events',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': ['get', 'color'],
    'circle-radius': ['case',
      ['==', ['get', 'severity'], 'extreme'], 7,
      ['==', ['get', 'severity'], 'high'],    6,
      5
    ],
    'circle-stroke-width': 1.5,
    'circle-stroke-color': 'rgba(255,255,255,0.6)',
    'circle-opacity': 0.9,
  },
};

export default function GlobeMap({ events }) {
  const [popupInfo, setPopupInfo] = useState(null);

  // Build GeoJSON from events for clustering support
  const geojson = useMemo(() => ({
    type: 'FeatureCollection',
    features: events
      .filter(e => e.latitude != null && e.longitude != null)
      .map(e => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [e.longitude, e.latitude] },
        properties: {
          id:          e._id || e.eventId,
          title:       e.title,
          disasterType: e.disasterType,
          severity:    e.severity,
          sourceAPI:   e.sourceAPI,
          magnitude:   e.magnitude,
          timestamp:   e.timestamp,
          color:       SEV_COLORS[e.severity] || '#999',
          latitude:    e.latitude,
          longitude:   e.longitude,
        },
      })),
  }), [events]);

  const handleMapClick = useCallback((e) => {
    const features = e.features;
    if (!features?.length) {
      setPopupInfo(null);
      return;
    }

    const feature = features[0];

    // If it's a cluster, do nothing (could zoom in here)
    if (feature.properties.point_count) return;

    setPopupInfo({
      longitude: feature.geometry.coordinates[0],
      latitude:  feature.geometry.coordinates[1],
      ...feature.properties,
    });
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
      <Map
        initialViewState={{ longitude: 78.9629, latitude: 20, zoom: 2 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        interactiveLayerIds={['unclustered-point', 'clusters']}
        onClick={handleMapClick}
        cursor="auto"
        onLoad={(e) => {
          const map = e.target;
          // MapLibre v5 requires style.load event and { type: 'globe' } object syntax
          const applyGlobe = () => {
            try {
              map.setProjection({ type: 'globe' });
              map.setFog({
                color: '#c8d8f0',
                'high-color': '#245bde',
                'horizon-blend': 0.05,
                'space-color': '#0a0f2e',
                'star-intensity': 0.6,
              });
            } catch (err) {
              console.warn('Globe projection error:', err.message);
            }
          };
          // style.load is the correct event in v5
          if (map.isStyleLoaded()) {
            applyGlobe();
          } else {
            map.once('style.load', applyGlobe);
          }
        }}
      >
        <NavigationControl position="top-right" />

        <Source
          id="events"
          type="geojson"
          data={geojson}
          cluster={true}
          clusterMaxZoom={6}
          clusterRadius={40}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>

        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="top"
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            maxWidth="280px"
          >
            <div style={{ padding: '4px 2px', fontSize: '13px', lineHeight: '1.6' }}>
              <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                {DISASTER_ICONS[popupInfo.disasterType] || '⚡'} {popupInfo.title}
              </strong>
              <span>
                Severity:{' '}
                <b style={{ color: SEV_COLORS[popupInfo.severity] }}>
                  {popupInfo.severity}
                </b>
              </span>
              <br />
              <span>Source: {popupInfo.sourceAPI}</span>
              {popupInfo.magnitude != null && (
                <>
                  <br />
                  <span>Magnitude: M{popupInfo.magnitude}</span>
                </>
              )}
              <br />
              <span style={{ color: '#888', fontSize: '12px' }}>
                {new Date(popupInfo.timestamp).toLocaleDateString('en-IN')}
              </span>
            </div>
          </Popup>
        )}
      </Map>

      {/* Subtle legend overlay */}
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
      }}>
        {Object.entries(SEV_COLORS).map(([k, v]) => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: v, display: 'inline-block' }} />
            {k.charAt(0).toUpperCase() + k.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
}
