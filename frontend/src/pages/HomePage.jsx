import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import LocationBanner from '../components/LocationBanner';
import StatBar from '../components/StatBar';
import AlertCard from '../components/AlertCard';
import LoadingSpinner from '../components/LoadingSpinner';

import { fetchAllEvents, fetchNearbyEvents, fetchStats } from '../services/api';

export default function HomePage({ geo, updateLastUpdated }) {
  const [stats, setStats]         = useState(null);
  const [recent, setRecent]       = useState([]);
  const [nearby, setNearby]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [backendOk, setBackendOk] = useState(null);


  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, eventsData] = await Promise.all([
        fetchStats(),
        fetchAllEvents({ limit: 6 }),
      ]);
      setStats(statsData);
      setRecent(eventsData?.events || []);
      setBackendOk(true);
      if (updateLastUpdated) updateLastUpdated(new Date());

    } catch {
      setBackendOk(false);
    } finally {
      setLoading(false);
    }
  }, [updateLastUpdated]);

  const loadNearby = useCallback(async () => {
    if (geo.status !== 'granted') return;
    try {
      const d = await fetchNearbyEvents(geo.lat, geo.lon);
      setNearby(d?.events || []);
    } catch (err) { console.warn('[Nearby] Failed to fetch nearby events:', err); }
  }, [geo.status, geo.lat, geo.lon]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadNearby(); }, [loadNearby]);

  return (
    <div>
      {/* ── Hero ── */}
      <div className="hero">
        <div className="container hero-inner">
          <div className="hero-flag">🇮🇳</div>
          <div>
            <h1>India Disaster Alert System</h1>
            <p className="hero-sub">
              Real-time early warning platform aggregating data from NASA FIRMS and OpenMeteo.
              No registration required.
            </p>
            <div className="hero-actions">
              <Link to="/alerts" className="btn-primary">View All Alerts</Link>
              <Link to="/map" className="btn-secondary">Open Map</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container page-content">
        {/* Backend status */}
        {backendOk === false && (
          <div className="alert-banner danger">
            ⚠️ Backend server is not reachable. Start the backend with{' '}
            <code style={{ fontFamily: 'monospace' }}>npm run dev</code> in{' '}
            <code style={{ fontFamily: 'monospace' }}>backend/</code>.
          </div>
        )}

        {/* Location Banner */}
        <LocationBanner geo={geo} />



        {/* Stats */}
        {loading ? (
          <LoadingSpinner text="Loading disaster data…" />
        ) : (
          <>
            <StatBar stats={stats} nearbyCount={nearby.length} />

            {/* Nearby events */}
            {geo.status === 'granted' && nearby.length > 0 && (
              <section style={{ marginBottom: 28 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 12
                }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>
                    📍 Events Near You ({nearby.length})
                  </h2>
                  <Link to="/alerts" style={{ fontSize: '0.82rem', color: '#2563EB' }}>
                    View all →
                  </Link>
                </div>
                <div className="alert-list">
                  {nearby.slice(0, 4).map((e) => (
                    <AlertCard key={e._id || e.eventId} event={e} />
                  ))}
                </div>
              </section>
            )}

            {/* Recent events */}
            <section>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 12
              }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>
                  🕒 Recent Events
                </h2>
                <Link to="/alerts" style={{ fontSize: '0.82rem', color: '#2563EB' }}>
                  View all →
                </Link>
              </div>

              {recent.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✅</div>
                  <h3>No active events</h3>
                  <p>The system found no current events. Data refreshes every 5 minutes.</p>
                </div>
              ) : (
                <div className="alert-list">
                  {recent.map((e) => (
                    <AlertCard key={e._id || e.eventId} event={e} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
