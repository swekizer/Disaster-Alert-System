import { useState, useEffect, useMemo } from 'react';
import AlertCard from '../components/AlertCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchAllEvents, fetchNearbyEvents, deleteAllEvents } from '../services/api';

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'earthquake',    label: 'Earthquake' },
  { value: 'flood',         label: 'Flood' },
  { value: 'cyclone',       label: 'Cyclone' },
  { value: 'storm',         label: 'Storm' },
  { value: 'rain',          label: 'Rain / Weather' },
  { value: 'wildfire',      label: 'Wildfire' },
  { value: 'volcano',       label: 'Volcano' },
  { value: 'weather_alert', label: 'Official Alert' },
];

const SEV_OPTIONS = [
  { value: '',        label: 'All Severities' },
  { value: 'extreme', label: 'Extreme' },
  { value: 'high',    label: 'High Alert' },
  { value: 'medium',  label: 'Warning' },
  { value: 'low',     label: 'Low' },
];

import PollingTimer from '../components/PollingTimer';

export default function AlertsPage({ geo, updateLastUpdated }) {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [typeFilter, setType] = useState('');
  const [sevFilter, setSev]   = useState('');
  const [nearby, setNearby]   = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      if (nearby && geo.status === 'granted') {
        const d = await fetchNearbyEvents(geo.lat, geo.lon);
        setEvents(d.events || []);
      } else {
        const d = await fetchAllEvents({ limit: 300 });
        setEvents(d.events || []);
      }
      if (updateLastUpdated) updateLastUpdated(new Date());
      setRefreshKey(prev => prev + 1); // Reset timer
    } catch (e) {
      setError('Unable to load events. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAlerts = async () => {
    if (!window.confirm('Are you sure you want to clear all alerts? This will delete them from the database.')) return;
    try {
      setLoading(true);
      await deleteAllEvents();
      await loadEvents();
    } catch (e) {
      setError('Failed to clear alerts.');
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, [nearby, geo.status]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (typeFilter && e.disasterType !== typeFilter) return false;
      if (sevFilter  && e.severity     !== sevFilter)  return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.title?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, typeFilter, sevFilter, search]);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>🚨 Disaster Alerts</h1>
          <p>
            {nearby && geo.status === 'granted'
              ? 'Showing events near your location.'
              : 'Showing all active events across India and surrounding region.'}
          </p>
        </div>
      </div>

      <div className="container page-content">
        {/* Polling Timer - Linked to backend logic */}
        <PollingTimer onTimeout={loadEvents} resetKey={refreshKey} interval={300} />
        {/* Controls */}
        <div className="alert-list-controls">
          <input
            className="search-input"
            placeholder="Search events…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select className="filter-select" value={typeFilter} onChange={(e) => setType(e.target.value)}>
            {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select className="filter-select" value={sevFilter} onChange={(e) => setSev(e.target.value)}>
            {SEV_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {geo.status === 'granted' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={nearby}
                onChange={(e) => setNearby(e.target.checked)}
              />
              Near me only
            </label>
          )}

          <button className="refresh-btn" onClick={loadEvents}>↻ Refresh</button>
          <button className="refresh-btn" style={{ backgroundColor: '#dc3545', color: 'white', borderColor: '#dc3545', marginLeft: '8px' }} onClick={handleClearAlerts}>🗑️ Clear All</button>
          <span className="result-count">{filtered.length} events</span>
        </div>

        {/* Error */}
        {error && <div className="alert-banner danger">⚠️ {error}</div>}

        {/* Loading */}
        {loading ? (
          <LoadingSpinner text="Fetching disaster events…" />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>No events found</h3>
            <p>No matching disaster events are currently active. This is a good sign!</p>
          </div>
        ) : (
          <div className="alert-list">
            {filtered.map((e) => (
              <AlertCard key={e._id || e.eventId} event={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
