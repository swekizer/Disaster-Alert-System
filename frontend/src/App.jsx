import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import { useGeolocation } from './components/LocationBanner';
import HomePage   from './pages/HomePage';
import AlertsPage from './pages/AlertsPage';
import MapPage    from './pages/MapPage';
import AboutPage  from './pages/AboutPage';
import './index.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-disclaimer">
          <strong>⚠️ Disclaimer:</strong> This is an informational platform. For official government
          alerts, follow NDMA, IMD, and state disaster management authorities.
        </div>
        <div>
          IDAS &copy; {new Date().getFullYear()} &mdash; Data from USGS, NASA EONET, OpenWeather, GDACS
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const geo = useGeolocation();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const updateLastUpdated = (date = new Date()) => {
    setLastUpdated(date);
  };

  return (
    <BrowserRouter>
      <Navbar lastUpdated={lastUpdated} />
      <main>
        <Routes>
          <Route path="/"        element={<HomePage   geo={geo} updateLastUpdated={updateLastUpdated} />} />
          <Route path="/alerts"  element={<AlertsPage geo={geo} updateLastUpdated={updateLastUpdated} />} />
          <Route path="/map"     element={<MapPage />} />
          <Route path="/about"   element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
