export default function AboutPage() {
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>ℹ️ About IDAS</h1>
          <p>India Disaster Alert System — open, real-time disaster early warning platform.</p>
        </div>
      </div>

      <div className="container page-content">
        <div className="about-grid">
          {/* Overview */}
          <div className="about-card">
            <h3>What is IDAS?</h3>
            <p>
              The India Disaster Alert System (IDAS) is an open-access, location-based early
              warning platform that aggregates data from multiple global disaster monitoring
              agencies and presents it in a single, unified interface.
            </p>
            <br />
            <p>
              No account or registration is required. The system uses your browser&apos;s
              built-in geolocation API to show events near you.
            </p>
          </div>

          {/* How it works */}
          <div className="about-card">
            <h3>How It Works</h3>
            <ul>
              <li>A background service fetches data from external APIs every 5 minutes.</li>
              <li>Each event is stored with its geographic coordinates.</li>
              <li>When you provide your location, the system uses the Haversine formula to calculate your distance to every active event.</li>
              <li>Events within a defined alert radius for that disaster type are surfaced as nearby alerts.</li>
              <li>You can also browse all active events without sharing your location.</li>
            </ul>
          </div>

          {/* Data Sources */}
          <div className="about-card" style={{ gridColumn: '1 / -1' }}>
            <h3>Data Sources</h3>
            <table className="source-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Agency</th>
                  <th>Data Provided</th>
                  <th>Update Frequency</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>USGS Earthquake Feeds</td>
                  <td>United States Geological Survey</td>
                  <td>Earthquakes M2.5+, past 24h</td>
                  <td>Every 5 minutes</td>
                </tr>
                <tr>
                  <td>NASA EONET</td>
                  <td>NASA Earth Observatory</td>
                  <td>Wildfires, storms, floods, volcanoes (open events)</td>
                  <td>Every 5 minutes</td>
                </tr>
                <tr>
                  <td>OpenWeatherMap</td>
                  <td>OpenWeather Ltd.</td>
                  <td>Severe weather alerts, storm/rain conditions for major Indian cities</td>
                  <td>Every 5 minutes</td>
                </tr>
                <tr>
                  <td>GDACS</td>
                  <td>Joint Research Centre — EU / UN</td>
                  <td>Cyclones, floods, earthquakes, volcanoes — global alerts</td>
                  <td>Every 5 minutes</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Alert Radii */}
          <div className="about-card">
            <h3>Alert Radius by Disaster Type</h3>
            <table className="source-table">
              <thead>
                <tr><th>Disaster Type</th><th>Alert Radius</th></tr>
              </thead>
              <tbody>
                {[
                  ['Rain / Weather Alert', '50 km'],
                  ['Extreme Temperature', '100 km'],
                  ['Flood', '100 km'],
                  ['Storm', '300 km'],
                  ['Cyclone', '500 km'],
                  ['Earthquake', '300 km'],
                  ['Wildfire', '150 km'],
                  ['Volcano', '200 km'],
                ].map(([type, radius]) => (
                  <tr key={type}>
                    <td>{type}</td>
                    <td>{radius}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Disclaimers */}
          <div className="about-card">
            <h3>Disclaimer</h3>
            <ul>
              <li>This system relies on third-party APIs and may experience data delays or outages.</li>
              <li>Alerts are informational only and should not replace official government advisories.</li>
              <li>Always follow instructions from local disaster management authorities (NDMA, IMD, state SDMAs).</li>
              <li>False positives or missed events are possible. Use this as a supplementary awareness tool.</li>
            </ul>
            <br />
            <p>
              <strong>Official sources:</strong>{' '}
              <a href="https://ndma.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB' }}>NDMA</a>,{' '}
              <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB' }}>IMD</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
