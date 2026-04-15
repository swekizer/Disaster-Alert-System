export default function AboutPage() {
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>ℹ️ About IDAS</h1>
          <p>
            India Disaster Alert System — open, real-time disaster early warning
            platform.
          </p>
        </div>
      </div>

      <div className="container page-content">
        <div className="about-grid">
          {/* Overview */}
          <div className="about-card">
            <h3>What is IDAS?</h3>
            <p>
              The India Disaster Alert System (IDAS) is a free, open-access
              early warning platform built specifically for India. It
              continuously monitors extreme weather, active wildfires, air
              quality, and seismic activity by ingesting data from trusted
              scientific sources — <strong>Open-Meteo</strong>,{" "}
              <strong>NASA FIRMS</strong>, <strong>USGS</strong>, and{" "}
              <strong>WAQI</strong>.
            </p>
            <br />
            <p>
              No account or registration is required. The system uses your
              browser&apos;s built-in Geolocation API to detect events near you
              and surface them as priority alerts.
            </p>
          </div>

          {/* How it works */}
          <div className="about-card">
            <h3>How It Works</h3>
            <ul>
              <li>
                A background engine fetches data from Open-Meteo, NASA FIRMS,
                USGS, and WAQI continuously.
              </li>
              <li>
                Open-Meteo forecasts are checked against strict thresholds to
                extract only extreme conditions (e.g. rainfall &gt; 50 mm,
                temperature &gt; 40 °C, gusts &gt; 70 km/h).
              </li>
              <li>
                NASA FIRMS satellite passes are filtered for high-confidence
                thermal anomalies with significant Fire Radiative Power (FRP
                &gt; 15 MW).
              </li>
              <li>
                All qualifying events are stored in MongoDB with their
                geographic coordinates and severity.
              </li>
              <li>
                When you share your location, the system uses the{" "}
                <strong>Haversine formula</strong> to calculate your distance to
                every active event.
              </li>
              <li>
                Events within the defined alert radius for that disaster type
                are shown as nearby alerts.
              </li>
              <li>
                You can also browse all active events across India without
                sharing your location.
              </li>
            </ul>
          </div>

          {/* Data Sources */}
          <div className="about-card" style={{ gridColumn: "1 / -1" }}>
            <h3>Data Sources</h3>
            <table className="source-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Provider</th>
                  <th>What It Detects</th>
                  <th>Coverage</th>
                  <th>Update Frequency</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Open-Meteo Forecast API</strong>
                  </td>
                  <td>Open-Meteo (open-source, free)</td>
                  <td>
                    Extreme rainfall, floods, heatwaves, coldwaves, storms,
                    cyclones, thunderstorms, blizzards, extreme UV radiation
                  </td>
                  <td>41 monitoring cities across all regions of India</td>
                  <td>Every 5 minutes</td>
                </tr>
                <tr>
                  <td>
                    <strong>NASA FIRMS — VIIRS SNPP NRT</strong>
                  </td>
                  <td>NASA / LANCE FIRMS</td>
                  <td>
                    Active wildfires and high-intensity thermal anomalies
                    detected via VIIRS satellite
                  </td>
                  <td>India bounding box (6.5°N–37.5°N, 68°E–97.5°E)</td>
                  <td>Every 5 minutes</td>
                </tr>
                <tr>
                  <td>
                    <strong>USGS Earthquakes</strong>
                  </td>
                  <td>US Geological Survey</td>
                  <td>Recent earthquakes (magnitude &gt; 0)</td>
                  <td>South/SE Asia (-5°N–45°N, 55°E–110°E)</td>
                  <td>Continuous</td>
                </tr>
                <tr>
                  <td>
                    <strong>WAQI Air Quality</strong>
                  </td>
                  <td>World Air Quality Index Project</td>
                  <td>Severe air pollution (AQI &gt; 150)</td>
                  <td>South/SE Asia (-5°N–45°N, 55°E–110°E)</td>
                  <td>Continuous</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Event Types */}
          <div className="about-card" style={{ gridColumn: "1 / -1" }}>
            <h3>Detected Event Types &amp; Thresholds</h3>
            <table className="source-table">
              <thead>
                <tr>
                  <th>Event Type</th>
                  <th>Source</th>
                  <th>Trigger Condition</th>
                  <th>Max Severity</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "Extreme Flood",
                    "Open-Meteo",
                    "Daily rainfall > 100 mm",
                    "Extreme",
                  ],
                  [
                    "Heavy Rainfall",
                    "Open-Meteo",
                    "Daily rainfall > 50 mm",
                    "High",
                  ],
                  [
                    "Severe Heatwave",
                    "Open-Meteo",
                    "Max temperature > 42 °C",
                    "Extreme",
                  ],
                  [
                    "Heatwave Warning",
                    "Open-Meteo",
                    "Max temperature > 40 °C",
                    "High",
                  ],
                  [
                    "Severe Coldwave",
                    "Open-Meteo",
                    "Min temperature < 2 °C",
                    "Extreme",
                  ],
                  [
                    "Coldwave Warning",
                    "Open-Meteo",
                    "Min temperature < 5 °C",
                    "High",
                  ],
                  [
                    "Destructive Wind",
                    "Open-Meteo",
                    "Wind gusts > 90 km/h",
                    "Extreme",
                  ],
                  [
                    "Severe Storm",
                    "Open-Meteo",
                    "Wind gusts > 70 km/h",
                    "High",
                  ],
                  [
                    "Thunderstorm + Hail",
                    "Open-Meteo",
                    "WMO weather code 96 or 99 (severe hail)",
                    "Extreme",
                  ],
                  [
                    "Thunderstorm Warning",
                    "Open-Meteo",
                    "WMO weather code 95",
                    "High",
                  ],
                  [
                    "Blizzard / Heavy Snow",
                    "Open-Meteo",
                    "Snowfall > 30 cm",
                    "Extreme",
                  ],
                  [
                    "Extreme UV Radiation",
                    "Open-Meteo",
                    "UV Index ≥ 11",
                    "High",
                  ],
                  [
                    "Active Wildfire",
                    "NASA FIRMS",
                    "VIIRS thermal anomaly, FRP > 15 MW, confidence: nominal or high",
                    "Extreme",
                  ],
                  [
                    "Earthquake",
                    "USGS",
                    "Magnitude ≥ 4.0 (Medium), ≥ 5.5 (High), ≥ 7.0 (Extreme)",
                    "Varies",
                  ],
                  [
                    "Severe Air Quality",
                    "WAQI",
                    "AQI > 150 (Medium), > 200 (High), > 300 (Extreme)",
                    "Varies",
                  ],
                ].map(([type, source, condition, severity]) => (
                  <tr key={type}>
                    <td>
                      <strong>{type}</strong>
                    </td>
                    <td>{source}</td>
                    <td>{condition}</td>
                    <td>{severity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Monitoring Coverage */}
          <div className="about-card" style={{ gridColumn: "1 / -1" }}>
            <h3>Weather Monitoring Coverage</h3>
            <p>
              Open-Meteo forecasts are checked at{" "}
              <strong>41 strategically selected cities</strong> spanning every
              geographic region of India. Requests are batched and run every 5
              minutes.
            </p>
            <br />
            <table className="source-table">
              <thead>
                <tr>
                  <th>Region</th>
                  <th>Monitored Cities</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "North",
                    "Srinagar, Jammu, Shimla, Dehradun, Ludhiana, Delhi, Lucknow, Patna",
                  ],
                  [
                    "West",
                    "Jaipur, Jodhpur, Ahmedabad, Rajkot, Surat, Mumbai, Pune",
                  ],
                  ["Central", "Bhopal, Indore, Nagpur, Raipur"],
                  ["East", "Kolkata, Ranchi, Bhubaneswar, Puri"],
                  [
                    "North-East",
                    "Guwahati, Shillong, Gangtok, Dibrugarh, Agartala, Imphal, Aizawl",
                  ],
                  [
                    "South",
                    "Hyderabad, Vijayawada, Hubli, Bengaluru, Chennai, Coimbatore, Kochi, Thiruvananthapuram, Madurai",
                  ],
                  [
                    "Islands",
                    "Port Blair (Andaman & Nicobar), Kavaratti (Lakshadweep)",
                  ],
                ].map(([region, cities]) => (
                  <tr key={region}>
                    <td>
                      <strong>{region}</strong>
                    </td>
                    <td>{cities}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <br />
            <p>
              Wildfire detection via NASA FIRMS covers the{" "}
              <strong>entire Indian landmass</strong> (6.5°N–37.5°N,
              68°E–97.5°E) using near-real-time satellite passes from the VIIRS
              instrument aboard the Suomi NPP satellite.
            </p>
            <br />
            <p>
              Earthquake (USGS) and Air Quality (WAQI) monitoring covers a
              broader <strong>South and Southeast Asia region</strong> (-5° to
              45° Lat, 55° to 110° Lon) to capture events that may impact the
              subcontinent.
            </p>
          </div>

          {/* Alert Radii */}
          <div className="about-card">
            <h3>Alert Radius by Disaster Type</h3>
            <p>
              When you share your location, events within the following radii
              are highlighted as alerts that may affect you.
            </p>
            <br />
            <table className="source-table">
              <thead>
                <tr>
                  <th>Disaster Type</th>
                  <th>Alert Radius</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Heavy Rainfall", "50 km"],
                  ["Flood / Extreme Rainfall", "100 km"],
                  ["Heatwave / Coldwave / UV / Snow", "150 km"],
                  ["Wildfire", "150 km"],
                  ["Volcano", "200 km"],
                  ["Storm / Thunderstorm", "300 km"],
                  ["Earthquake", "300 km"],
                  ["Cyclone", "500 km"],
                ].map(([type, radius]) => (
                  <tr key={type}>
                    <td>{type}</td>
                    <td>
                      <strong>{radius}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Disclaimers */}
          <div className="about-card">
            <h3>Disclaimer</h3>
            <ul>
              <li>
                IDAS relies on third-party APIs (Open-Meteo, NASA FIRMS, USGS,
                WAQI) and may experience data delays or temporary outages.
              </li>
              <li>
                Weather monitoring is limited to the 41 listed cities. Events
                occurring between monitoring points may not be detected.
              </li>
              <li>
                Wildfire alerts are based on satellite thermal anomalies and may
                include industrial heat sources or large agricultural burns.
              </li>
              <li>
                All alerts are informational only and must not replace official
                government advisories or evacuation orders.
              </li>
              <li>
                Always follow instructions from local disaster management
                authorities.
              </li>
            </ul>
            <br />
            <p>
              <strong>Official sources:</strong>{" "}
              <a
                href="https://ndma.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#2563EB" }}
              >
                NDMA
              </a>
              ,{" "}
              <a
                href="https://mausam.imd.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#2563EB" }}
              >
                IMD
              </a>
              ,{" "}
              <a
                href="https://firms.modaps.eosdis.nasa.gov"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#2563EB" }}
              >
                NASA FIRMS
              </a>
              ,{" "}
              <a
                href="https://open-meteo.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#2563EB" }}
              >
                Open-Meteo
              </a>
              ,{" "}
              <a
                href="https://earthquake.usgs.gov"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#2563EB" }}
              >
                USGS
              </a>
              ,{" "}
              <a
                href="https://waqi.info"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#2563EB" }}
              >
                WAQI
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
