import Parser from "rss-parser";

const parser = new Parser();
const FEED_URL = "https://www.dekoudebron.nl/feed/rss2";

// ⚠️ Tijdelijke cache (vervang later met DB)
let cache = new Map();

// 🔐 Zet deze in Vercel env
const API_KEY = process.env.API_KEY;

// 🔁 Retry mechanisme
async function retry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;

    console.log(`Retry in ${delay}ms...`);
    await new Promise((res) => setTimeout(res, delay));

    return retry(fn, retries - 1, delay * 2);
  }
}

// 📡 RSS ophalen
async function fetchFeed() {
  const feed = await parser.parseURL(FEED_URL);
  return feed.items;
}

export default async function handler(req, res) {
  // 🔐 API beveiliging
  const key = req.headers["x-api-key"];
  if (!API_KEY || key !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const items = await retry(fetchFeed);

    let newItems = [];

    for (const item of items) {
      const guid = item.guid || item.link;

      if (!cache.has(guid)) {
        const article = {
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          description: item.contentSnippet,
        };

        cache.set(guid, article);
        newItems.push(article);

        // 📄 Logging
        console.log(
          JSON.stringify({
            level: "info",
            message: "Nieuw artikel",
            title: item.title,
            timestamp: new Date().toISOString(),
          })
        );
      }
    }

    return res.status(200).json({
      success: true,
      newCount: newItems.length,
      articles: Array.from(cache.values()),
    });

  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        message: "Feed verwerking mislukt",
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    );

    return res.status(500).json({
      success: false,
      error: "Feed verwerking mislukt",
    });
  }
}
