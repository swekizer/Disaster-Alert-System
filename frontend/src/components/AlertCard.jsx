import { useNavigate } from "react-router-dom";

const DISASTER_ICONS = {
  earthquake: "🌍",
  flood: "🌊",
  cyclone: "🌀",
  rain: "🌧️",
  wildfire: "🔥",
  storm: "⛈️",
  volcano: "🌋",
  weather_alert: "⚠️",
  heatwave: "🌡️",
  drought: "🏜️",
  snow: "❄️",
  ice: "🧊",
};

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDateTime(ts) {
  const date = new Date(ts);

  // Format time: 7:43 pm
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const timeStr = `${displayHours}:${minutes} ${ampm}`;

  // Format day: Thursday
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayStr = dayNames[date.getDay()];

  // Format date: 4 March 2026
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dateNum = date.getDate();
  const monthStr = monthNames[date.getMonth()];
  const yearStr = date.getFullYear();

  return `${timeStr} ${dayStr} ${dateNum} ${monthStr} ${yearStr}`;
}

export default function AlertCard({ event }) {
  const navigate = useNavigate();
  const {
    disasterType = "default",
    title,
    description,
    severity,
    sourceAPI,
    timestamp,
    distanceKm,
    magnitude,
    externalUrl,
    latitude,
    longitude,
  } = event;

  const icon = DISASTER_ICONS[disasterType] || "⚡";

  const handleClick = () => {
    if (latitude != null && longitude != null) {
      navigate(`/map?lat=${latitude}&lon=${longitude}&zoom=10`);
    }
  };

  return (
    <div
      className={`alert-card severity-${severity}`}
      onClick={handleClick}
      style={{
        cursor: latitude != null && longitude != null ? "pointer" : "inherit",
      }}
    >
      {/* Icon */}
      <div className={`alert-icon ${disasterType} default`}>
        <span role="img" aria-label={disasterType}>
          {icon}
        </span>
      </div>

      {/* Body */}
      <div className="alert-body">
        <div className="alert-title" title={title}>
          {title}
        </div>
        {description && <div className="alert-desc">{description}</div>}
        <div className="alert-meta">
          <span className="alert-time">{formatDateTime(timestamp)}</span>
          {distanceKm != null && (
            <span className="alert-distance">
              <span>{distanceKm} km away</span>
            </span>
          )}
          {magnitude != null && (
            <span
              className="badge badge-medium"
              style={{ fontSize: "0.68rem", padding: "1px 7px" }}
            >
              M{magnitude}
            </span>
          )}
          <span className={`alert-source source-${sourceAPI}`}>
            {sourceAPI}
          </span>
        </div>
      </div>

      {/* Side */}
      <div className="alert-side">
        <span className={`badge badge-${severity}`}>
          {severity === "extreme"
            ? "Extreme"
            : severity === "high"
              ? "High Alert"
              : severity === "medium"
                ? "Warning"
                : "Low"}
        </span>
        {externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.72rem", color: "#3B82F6" }}
            onClick={(e) => e.stopPropagation()}
          >
            Details ↗
          </a>
        )}
      </div>
    </div>
  );
}
