import fetch from "node-fetch";

export default async function handler(req, res) {
    try {
        const rssUrl = "https://www.dekoudebron.nl/feed/rss2";
        const response = await fetch(rssUrl);
        const text = await response.text();

        const items = text
            .split("<item>")
            .slice(1)
            .map(block => {
                const titleMatch = block.match(/<title>(.*?)<\/title>/);
                const linkMatch  = block.match(/<link>(.*?)<\/link>/);
                const descMatch  = block.match(/<description>(.*?)<\/description>/);
                return {
                    title: titleMatch ? titleMatch[1] : "Geen titel",
                    link:  linkMatch  ? linkMatch[1]  : "#",
                    description: descMatch ? descMatch[1] : ""
                };
            });

        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "s-maxage=86400");
        res.status(200).json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Kan RSS niet ophalen" });
    }
}