const express = require('express');
const axios   = require('axios');
const router  = express.Router();

// ── In-memory cache (30 min TTL to conserve free-tier quota) ─────────────────
const CACHE_TTL_MS = 30 * 60 * 1000;
const cache = new Map(); // key → { data, ts }

function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) { cache.delete(key); return null; }
  return entry.data;
}
function cacheSet(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

// ── Topic → search query mapping ────────────────────────────────────────────
const TOPIC_QUERIES = {
  all:       'disaster OR flood OR cyclone OR earthquake OR wildfire OR heatwave OR weather alert India',
  weather:   'weather alert OR rain OR heatwave India',
  disaster:  'disaster relief OR emergency OR drought OR landslide India',
  earthquake:'earthquake India',
  flood:     'flood India',
  cyclone:   'cyclone OR storm India',
  wildfire:  'wildfire OR forest fire India',
};

// ── GET /api/news ─────────────────────────────────────────────────────────────
// Query params:
//   topic  = all | weather | disaster | earthquake | flood | cyclone | wildfire  (default: all)
//   date   = YYYY-MM-DD  (optional — filter to a specific day)
router.get('/', async (req, res) => {
  const { topic = 'all', date } = req.query;
  const apiKey = process.env.GNEWS_API_KEY;

  if (!apiKey) {
    return res.status(503).json({ error: 'GNEWS_API_KEY not configured.' });
  }

  const query = TOPIC_QUERIES[topic] || TOPIC_QUERIES.all;
  const cacheKey = `${topic}_${date || 'nodate'}`;

  const cached = cacheGet(cacheKey);
  if (cached) {
    return res.json({ ...cached, fromCache: true });
  }

  try {
    // GNews free tier: max 100 articles per request
    const params = new URLSearchParams({
      q:      query,
      lang:   'en',
      max:    '100',
      sortby: 'publishedAt',
      token:  apiKey,
    });

    // If a specific date is requested, use GNews from/to range
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      params.set('from', start.toISOString());
      params.set('to',   end.toISOString());
    }

    const url = `https://gnews.io/api/v4/search?${params.toString()}`;
    let json;
    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'IDAS-AlertSystem/1.0' },
        timeout: 15000,
      });
      json = response.data;
    } catch (axiosErr) {
      const status = axiosErr.response?.status || 502;
      const msg    = axiosErr.response?.data?.errors?.[0] || axiosErr.message;
      console.error('[News] GNews API error:', status, msg);
      return res.status(502).json({ error: 'Failed to fetch news from GNews API.', detail: msg });
    }

    const articles = (json.articles || []).map((a) => ({
      title:       a.title,
      description: a.description,
      url:         a.url,
      image:       a.image || null,
      publishedAt: a.publishedAt,
      sourceName:  a.source?.name  || 'Unknown',
      sourceUrl:   a.source?.url   || '#',
    }));

    // Group by date (YYYY-MM-DD based on publishedAt)
    const grouped = {};
    for (const article of articles) {
      const day = article.publishedAt
        ? article.publishedAt.slice(0, 10)
        : 'unknown';
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(article);
    }

    // Sorted days descending
    const days = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

    const payload = {
      topic,
      totalArticles: articles.length,
      days,
      grouped,
      fetchedAt: new Date().toISOString(),
      fromCache: false,
    };

    cacheSet(cacheKey, payload);
    return res.json(payload);
  } catch (err) {
    console.error('[News] Unexpected error:', err.message);
    return res.status(500).json({ error: 'Internal server error fetching news.' });
  }
});

module.exports = router;
