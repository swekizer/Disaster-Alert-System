import { useEffect, useState, useCallback } from 'react';
import { fetchNews } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';


// ── Constants ──────────────────────────────────────────────────────────────────
const TOPIC_OPTIONS = [
  { value: 'all',        label: '🌐 All',        color: '#1A2332' },
  { value: 'weather',    label: '🌤️ Weather',    color: '#0891B2' },
  { value: 'disaster',   label: '🚨 Disaster',   color: '#DC2626' },
  { value: 'earthquake', label: '🌍 Earthquake', color: '#7C3AED' },
  { value: 'flood',      label: '🌊 Flood',      color: '#1D4ED8' },
  { value: 'cyclone',    label: '🌀 Cyclone',    color: '#6D28D9' },
  { value: 'wildfire',   label: '🔥 Wildfire',   color: '#B45309' },
];

// Build last N days as { label, value: 'YYYY-MM-DD' }
function buildDayOptions(n = 7) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const label = i === 0
      ? 'Today'
      : i === 1
        ? 'Yesterday'
        : d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
    days.push({ label, value: iso });
  }
  return days;
}

const DAY_OPTIONS = buildDayOptions(7);

// ── Small sub-components ──────────────────────────────────────────────────────
function NewsCard({ article }) {
  const pubDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit',
      })
    : '';

  return (
    <div className="news-card">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        id={`news-article-${encodeURIComponent(article.url).slice(0, 30)}`}
        className="news-card-link"
      >
        {article.image ? (
          <div className="news-card-img-wrap">
            <img
              src={article.image}
              alt={article.title}
              className="news-card-img"
              onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
            />
          </div>
        ) : (
          <div className="news-card-img-placeholder">📰</div>
        )}

        <div className="news-card-body">
          <div className="news-card-meta-top">
            <span className="news-source-badge">{article.sourceName}</span>
            {pubDate && <span className="news-card-time">{pubDate}</span>}
          </div>
          <h3 className="news-card-title">{article.title}</h3>
          {article.description && (
            <p className="news-card-desc">{article.description}</p>
          )}

          <div className="news-card-footer">
            <span className="news-read-more">Read more →</span>
          </div>
        </div>
      </a>
    </div>
  );
}


function NewsSkeletonCard() {
  return (
    <div className="news-card news-skeleton" aria-hidden="true">
      <div className="news-card-img-placeholder news-skeleton-img" />
      <div className="news-card-body">
        <div className="news-skeleton-line short" />
        <div className="news-skeleton-line" />
        <div className="news-skeleton-line" />
        <div className="news-skeleton-line mid" />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NewsPage() {
  const [selectedDay,   setSelectedDay]   = useState(DAY_OPTIONS[0].value);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [articles,      setArticles]      = useState([]);
  const [totalCount,    setTotalCount]    = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [fetchedAt,     setFetchedAt]     = useState(null);

  const loadNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNews({ topic: selectedTopic, date: selectedDay });
      // Articles for the selected day (or all if grouped key not found)
      const grouped = data.grouped || {};
      const dayArticles = grouped[selectedDay] || [];
      // Fallback: if API returned data but nothing for exact date (can happen with free tier delay),
      // show articles from the closest available day
      if (dayArticles.length === 0 && data.days && data.days.length > 0) {
        const fallbackDay = data.days[0];
        setArticles(grouped[fallbackDay] || []);
      } else {
        setArticles(dayArticles);
      }
      setTotalCount(data.totalArticles || 0);
      setFetchedAt(data.fetchedAt || null);
    } catch (err) {
      setError('Could not load news. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedDay, selectedTopic]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const activeTopic = TOPIC_OPTIONS.find((t) => t.value === selectedTopic);

  return (
    <div id="news-page">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="page-header">
        <div className="container">
          <h1>📰 Disaster &amp; Weather News</h1>
          <p>
            Latest news about weather events, natural disasters, and emergency alerts in India —
            filtered by date and topic.
          </p>
        </div>
      </div>

      <div className="container page-content">

        {/* ── Day Picker ────────────────────────────────── */}
        <div className="news-day-picker" role="tablist" aria-label="Select date">
          {DAY_OPTIONS.map((day) => (
            <button
              key={day.value}
              id={`day-tab-${day.value}`}
              role="tab"
              aria-selected={selectedDay === day.value}
              className={`news-day-btn${selectedDay === day.value ? ' active' : ''}`}
              onClick={() => setSelectedDay(day.value)}
            >
              <span className="news-day-label">{day.label}</span>
              <span className="news-day-date">{day.value.slice(5)}</span>
            </button>
          ))}
        </div>

        {/* ── Topic Chips ───────────────────────────────── */}
        <div className="news-topic-chips" role="group" aria-label="Filter by topic">
          {TOPIC_OPTIONS.map((t) => (
            <button
              key={t.value}
              id={`topic-chip-${t.value}`}
              className={`news-topic-chip${selectedTopic === t.value ? ' active' : ''}`}
              style={selectedTopic === t.value ? { '--chip-color': t.color } : {}}
              onClick={() => setSelectedTopic(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Stats strip ───────────────────────────────── */}
        {!loading && !error && (
          <div className="news-stats-strip">
            <span className="news-stats-count">
              <strong>{articles.length}</strong> articles shown
              {totalCount > articles.length && ` · ${totalCount} total fetched`}
            </span>
            {fetchedAt && (
              <span className="news-stats-time">
                🔄 Refreshed {new Date(fetchedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              id="news-refresh-btn"
              className="refresh-btn"
              onClick={loadNews}
              title="Refresh news"
            >
              ↺ Refresh
            </button>
          </div>
        )}

        {/* ── Error ─────────────────────────────────────── */}
        {error && (
          <div className="alert-banner danger" style={{ marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Loading ───────────────────────────────────── */}
        {loading ? (
          <div className="news-grid" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <NewsSkeletonCard key={i} />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No news found</h3>
            <p>
              No {activeTopic?.label} news available for{' '}
              {DAY_OPTIONS.find((d) => d.value === selectedDay)?.label || selectedDay}.
              <br />
              Try a different date or topic, or check back later.
            </p>
          </div>
        ) : (
          <div className="news-grid" role="list">
            {articles.map((article, idx) => (
              <NewsCard key={`${article.url}-${idx}`} article={article} />
            ))}
          </div>
        )}

        {/* ── Free tier note ────────────────────────────── */}
        {!loading && (
          <p className="news-api-note">
            📡 News sourced via <a href="https://gnews.io" target="_blank" rel="noopener noreferrer">GNews API</a>.
            Free tier may show up to 12-hour delayed articles.
          </p>
        )}
      </div>
    </div>
  );
}
