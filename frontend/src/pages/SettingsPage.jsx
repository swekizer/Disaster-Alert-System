import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchPreferences, updatePreferences } from '../services/api';

export default function SettingsPage({ geo }) {
  const [prefs, setPrefs] = useState({
    email: '',
    emailEnabled: false,
    radius: 50,
    lat: null,
    lon: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) return;
    loadPrefs();
  }, [isSignedIn]);

  const loadPrefs = async () => {
    try {
      const data = await fetchPreferences();
      setPrefs({
        email: data.email || '',
        emailEnabled: data.emailEnabled || false,
        radius: data.radius || 50,
        lat: data.lat || null,
        lon: data.lon || null,
      });
    } catch (err) {
      console.error('Failed to load preferences', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrefs((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleUseCurrentLocation = () => {
    if (geo && geo.lat && geo.lon) {
      setPrefs((prev) => ({ ...prev, lat: geo.lat, lon: geo.lon }));
    } else {
      if (geo.request) geo.request();
      // If we don't have it immediately, we can rely on geo changing...
      // But let's just alert the user for now
      alert("Please allow location access in the banner above (or if already granted, wait a second) to capture current coordinates.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updatePreferences(prefs);
      setMessage('Preferences saved successfully!');
    } catch (err) {
      console.error('Failed to save', err);
      setMessage('Error saving preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content container">
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p className="loading-text">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>⚙️ Notification Settings</h1>
          <p>Manage your email alerts for nearby disaster events.</p>
        </div>
      </div>

      <div className="container page-content">
        <div className="card" style={{ padding: '24px', maxWidth: '600px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                name="emailEnabled"
                checked={prefs.emailEnabled}
                onChange={handleChange}
                style={{ width: '18px', height: '18px' }}
              />
              Enable Email Alerts
            </label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '26px' }}>
              Receive emails when new disaster events are detected near your saved location.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Email Address</label>
            <input
              type="email"
              name="email"
              value={prefs.email}
              onChange={handleChange}
              placeholder="e.g. you@example.com"
              className="search-input"
              required={prefs.emailEnabled}
              disabled={!prefs.emailEnabled}
              style={{ maxWidth: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Alert Radius (km)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="range"
                name="radius"
                min="10"
                max="500"
                step="10"
                value={prefs.radius}
                onChange={handleChange}
                disabled={!prefs.emailEnabled}
                style={{ flex: 1 }}
              />
              <span style={{ fontWeight: '600', minWidth: '40px' }}>{prefs.radius} km</span>
            </div>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-muted)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Saved Location coordinates</label>
              <button 
                type="button" 
                onClick={handleUseCurrentLocation}
                disabled={!prefs.emailEnabled}
                style={{ background: '#1E3A5F', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem' }}
              >
                📍 Use Current Location
              </button>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Latitude</span>
                <input type="number" step="any" name="lat" value={prefs.lat || ''} onChange={handleChange} className="search-input" disabled={!prefs.emailEnabled} required={prefs.emailEnabled} placeholder="e.g. 28.6139" />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Longitude</span>
                <input type="number" step="any" name="lon" value={prefs.lon || ''} onChange={handleChange} className="search-input" disabled={!prefs.emailEnabled} required={prefs.emailEnabled} placeholder="e.g. 77.2090" />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            style={{ 
              marginTop: '10px',
              padding: '12px 20px', 
              background: '#C62828', 
              color: '#fff', 
              fontWeight: '600', 
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.95rem'
            }}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>

          {message && (
            <div style={{ 
              padding: '10px', 
              borderRadius: 'var(--radius-sm)', 
              background: message.includes('Error') ? 'var(--danger-bg)' : 'var(--safe-bg)',
              color: message.includes('Error') ? 'var(--danger)' : 'var(--safe)',
              border: `1px solid ${message.includes('Error') ? 'var(--danger-border)' : 'var(--safe-border)'}`,
              fontSize: '0.85rem',
              fontWeight: '500',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}

        </form>
      </div>
    </div>
  </div>
  );
}
