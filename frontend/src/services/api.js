import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

export async function fetchAllEvents(params = {}) {
  const { data } = await api.get('/events', { params });
  return data;
}

export async function deleteAllEvents() {
  const { data } = await api.delete('/events');
  return data;
}

export async function fetchNearbyEvents(lat, lon, radius) {
  const params = { lat, lon };
  if (radius) params.radius = radius;
  const { data } = await api.get('/events/nearby', { params });
  return data;
}

export async function fetchStats() {
  const { data } = await api.get('/events/stats');
  return data;
}

export async function checkHealth() {
  const { data } = await api.get('/health');
  return data;
}
