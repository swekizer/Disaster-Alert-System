import { useState, useCallback } from 'react';

export function useGeolocation() {
  const [state, setState] = useState({
    status: 'idle', // idle | requesting | granted | denied
    lat: null,
    lon: null,
    error: null,
  });

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({
        ...s,
        status: 'denied',
        error: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    setState((s) => ({ ...s, status: 'requesting' }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: 'granted',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          error: null,
        });
      },
      (err) => {
        setState({
          status: 'denied',
          lat: null,
          lon: null,
          error: err.message || 'Location access denied.',
        });
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, []);

  return { ...state, request };
}

export default function LocationBanner({ geo }) {
  const { status, lat, lon, error, request } = geo;

  if (status === 'idle') {
    return (
      <div className="location-banner prompt">
        <span className="loc-icon">📍</span>
        <div className="loc-text">
          <strong>Enable Location for Nearby Alerts</strong>
          <span>Allow location access to see disaster events near you.</span>
        </div>
        <button onClick={request}>Allow Location</button>
      </div>
    );
  }

  if (status === 'requesting') {
    return (
      <div className="location-banner prompt">
        <span className="loc-icon">⏳</span>
        <div className="loc-text">
          <strong>Requesting location…</strong>
          <span>Please allow access in your browser prompt.</span>
        </div>
      </div>
    );
  }

  if (status === 'granted') {
    return (
      <div className="location-banner granted">
        <span className="loc-icon">✅</span>
        <div className="loc-text">
          <strong>Location Active</strong>
          <span>
            Lat {lat?.toFixed(4)}, Lon {lon?.toFixed(4)} — showing alerts within range
          </span>
        </div>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="location-banner denied">
        <span className="loc-icon">⚠️</span>
        <div className="loc-text">
          <strong>Location Unavailable</strong>
          <span>{error || 'Showing all India-region events.'}</span>
        </div>
        <button onClick={request}>Retry</button>
      </div>
    );
  }

  return null;
}
