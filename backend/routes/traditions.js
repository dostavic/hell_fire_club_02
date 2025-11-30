const fetch = global.fetch || ((...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)));

// Simple in-memory cache to avoid hammering Wikipedia
const cache = new Map(); // key -> { data, ts }
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 hours

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ImmiPath/1.0 (+https://immipath.example)' },
  });
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  return res.json();
}

async function traditionsRoutes(fastify) {
  fastify.get('/', async (request, reply) => {
    const { country, city, lang = 'en' } = request.query;
    if (!country) {
      return reply.code(400).send({ message: 'country is required' });
    }

    const key = `${country}|${city || ''}|${lang}`;
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && now - cached.ts < CACHE_TTL) {
      return { items: cached.data, cached: true };
    }

    const searchQuery = city
      ? `${city} traditions culture history`
      : `${country} traditions culture history`;

    try {
      const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        searchQuery
      )}&format=json&srlimit=10&srprop=`;
      const searchData = await fetchJson(searchUrl);
      const titles = (searchData.query?.search || []).map((s) => s.title).slice(0, 8);
      if (!titles.length) {
        return reply.code(404).send({ message: 'Nothing found' });
      }

      const summaries = await Promise.all(
        titles.map(async (title) => {
          try {
            const summaryUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
            const s = await fetchJson(summaryUrl);
            return {
              title: s.title || title,
              extract: s.extract,
              url: s.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
              thumbnail: s.thumbnail?.source || null,
              description: s.description || null,
            };
          } catch (err) {
            return null;
          }
        })
      );

      const items = summaries.filter(Boolean);
      cache.set(key, { data: items, ts: now });
      return { items, cached: false };
    } catch (err) {
      request.log.error({ err }, 'traditions fetch failed');
      return reply.code(500).send({ message: 'Failed to fetch traditions' });
    }
  });
}

module.exports = traditionsRoutes;
