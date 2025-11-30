const fetch = global.fetch || ((...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)));

async function placesRoutes(fastify) {
  const openaiKey = process.env.OPENAI_API_KEY;

  // Helper: GET JSON with UA
  const fetchJson = async (url) => {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ImmiPath/1.0 (+https://example.com)' },
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  };

  fastify.get('/', async (request, reply) => {
    const { city, type } = request.query;
    if (!city) {
      return reply.code(400).send({ message: 'city is required' });
    }

    try {
      // 1) Geocode city to bbox via Nominatim (OSM)
      const geo = await fetchJson(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`
      );
      if (!geo?.length) {
        return reply.code(404).send({ message: 'City not found' });
      }
      const bbox = geo[0].boundingbox; // [south, north, west, east]
      const [south, north, west, east] = bbox.map(parseFloat);

      // 2) Query Overpass for interesting places within bbox
      const defaultQuery = `
        [out:json][timeout:15];
        (
          node["tourism"~"attraction|museum|gallery|viewpoint"](${south},${west},${north},${east});
          node["amenity"~"cafe|restaurant|bar|pub|library"](${south},${west},${north},${east});
          node["leisure"~"park|garden"](${south},${west},${north},${east});
        );
        out center 20;
      `;

      const historicQuery = `
        [out:json][timeout:20];
        (
          node["historic"](${south},${west},${north},${east});
          way["historic"](${south},${west},${north},${east});
          relation["historic"](${south},${west},${north},${east});
          node["tourism"="museum"](${south},${west},${north},${east});
          way["tourism"="museum"](${south},${west},${north},${east});
          node["tourism"="attraction"]["heritage"](${south},${west},${north},${east});
          way["tourism"="attraction"]["heritage"](${south},${west},${north},${east});
        );
        out center 20;
      `;

      const query = type === 'historic' ? historicQuery : defaultQuery;
      const overpassUrl = 'https://overpass-api.de/api/interpreter';
      const overpassRes = await fetch(overpassUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'ImmiPath/1.0 (+https://example.com)',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!overpassRes.ok) {
        return reply.code(502).send({ message: 'Overpass error', status: overpassRes.status });
      }
      const data = await overpassRes.json();
      const elements = data.elements || [];

      // Fetch optional images from Wikidata (best-effort, limited to first 8)
      const fetchImage = async (wikidataId, osmImage, name) => {
        try {
          if (osmImage) return osmImage;
          if (wikidataId) {
            const wd = await fetchJson(
              `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`
            );
            const entity = wd.entities?.[wikidataId];
            const file = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
            if (file) {
              const encoded = encodeURIComponent(file);
              return `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}?width=800`;
            }
          }

          // Try Wikimedia Commons search by name
          if (name) {
            const commons = await fetchJson(
              `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=original&pithumbsize=800&generator=search&gsrsearch=${encodeURIComponent(
                name
              )}&gsrlimit=1&origin=*`
            );
            const pages = commons?.query?.pages;
            if (pages) {
              const first = Object.values(pages)[0];
              const thumb = first?.thumbnail?.source;
              const original = first?.original?.source;
              if (thumb || original) return thumb || original;
            }
          }

          // Fallback placeholder with place name
          return `https://placehold.co/800x600?text=${encodeURIComponent(name || 'Place')}`;
        } catch (err) {
          return `https://placehold.co/800x600?text=${encodeURIComponent(name || 'Place')}`;
        }
      };

      const enriched = await Promise.all(
        elements
          .filter((el) => el.tags?.name) // пропускаємо безіменні
          .slice(0, 12)
          .map(async (el) => {
            const name = el.tags?.name;
            const address =
              el.tags?.['addr:full'] ||
              [el.tags?.['addr:street'], el.tags?.['addr:housenumber'], el.tags?.['addr:city'] || city]
                .filter(Boolean)
                .join(' ') ||
              city;
            const photoUrl = await fetchImage(el.tags?.wikidata, el.tags?.image, name);
            const photoRaw = photoUrl;
            return {
              id: el.id,
              name,
              address,
              rating: null,
              userRatingsTotal: null,
              priceLevel: null,
              openNow: null,
              photoUrl: photoRaw ? `/api/places/photo?url=${encodeURIComponent(photoRaw)}` : null,
              category: el.tags?.tourism || el.tags?.amenity || el.tags?.leisure || 'place',
            };
          })
      );

      const places = enriched;

      return { places };
    } catch (err) {
      request.log.error({ err }, 'places search failed');
      return reply.code(500).send({ message: 'Failed to fetch places' });
    }
  });

  fastify.post('/enrich', async (request, reply) => {
    const { name, address } = request.body || {};
    if (!name) {
      return reply.code(400).send({ message: 'name is required' });
    }
    if (!openaiKey) {
      return reply.code(500).send({ message: 'Missing OPENAI_API_KEY' });
    }

    const prompt = `
Give a concise, friendly blurb about the place "${name}" located at "${address || 'address unknown'}".
Include:
- One-sentence vibe/why visit.
- Estimated ticket/entry info if relevant (say "estimate" if unsure).
- Typical opening hours window (use "usually" and city norms if unknown).
Keep it under 90 words. Do not invent exact prices if not common knowledge; use ranges and hedges.
`;

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 180,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        request.log.error({ status: res.status, errBody }, 'openai error');
        return reply.code(500).send({ message: 'Failed to enrich place' });
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || 'No description available.';

      return { text };
    } catch (err) {
      request.log.error({ err }, 'enrich failed');
      return reply.code(500).send({ message: 'Failed to enrich place' });
    }
  });

  // Image proxy to avoid ORB/CORS issues
  fastify.get('/photo', async (request, reply) => {
    const { url } = request.query;
    if (!url || typeof url !== 'string') {
      return reply.code(400).send({ message: 'url is required' });
    }
    if (!/^https?:\/\//i.test(url)) {
      return reply.code(400).send({ message: 'invalid url' });
    }
    const fallback = 'https://placehold.co/800x600?text=ImmiPath';
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'ImmiPath/1.0 (+https://example.com)' } });
      if (!res.ok) {
        return reply.redirect(fallback);
      }
      const buffer = await res.arrayBuffer();
      const contentType = res.headers.get('content-type') || 'image/jpeg';
      reply.header('Content-Type', contentType);
      reply.header('Cache-Control', 'public, max-age=86400');
      return reply.send(Buffer.from(buffer));
    } catch (err) {
      request.log.error({ err }, 'photo proxy failed');
      return reply.redirect(fallback);
    }
  });
}

module.exports = placesRoutes;
