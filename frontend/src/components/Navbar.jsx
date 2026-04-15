import { NavLink, Link } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/alerts', label: 'Alerts' },
  { to: '/map', label: 'Map' },
  { to: '/about', label: 'About' },
  { to: '/settings', label: 'Settings' },
];

export default function Navbar({ lastUpdated }) {
  const ts = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🇮🇳</span>
          <span>
            India Disaster Alert System
            <span className="brand-subtitle">IDAS — Real-time Early Warning Platform</span>
          </span>
        </Link>

        <div className="navbar-nav">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {l.label}
            </NavLink>
          ))}
      </div>

        <div className="navbar-live" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div>
            <span className="live-dot" />
            {ts ? `Updated ${ts}` : 'Live monitoring'}
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  );
}
