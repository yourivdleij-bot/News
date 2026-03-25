import { XMLParser } from "fast-xml-parser";

export async function GET() {
    try {
        const rssUrl = "https://www.dekoudebron.nl/feed/rss2";
        const response = await fetch(rssUrl);

        if (!response.ok) {
            throw new Error("RSS ophalen mislukt");
        }

        const text = await response.text();

        const parser = new XMLParser({
            ignoreAttributes: false
        });

        const data = parser.parse(text);

        const rawItems = data?.rss?.channel?.item || [];
        const itemsArray = Array.isArray(rawItems) ? rawItems : [rawItems];

        const items = itemsArray
            .slice(0, 6)
            .map(item => {
                let image = null;

                if (item["media:content"]?.["@_url"]) {
                    image = item["media:content"]["@_url"];
                } else if (item.enclosure?.["@_url"]) {
                    image = item.enclosure["@_url"];
                } else if (item["media:thumbnail"]?.["@_url"]) {
                    image = item["media:thumbnail"]["@_url"];
                } else if (item.description) {
                    const match = item.description.match(/<img[^>]+src="(.*?)"/);
                    if (match) image = match[1];
                }

                return {
                    title: item.title || "Geen titel",
                    link: item.link || "#",
                    description: item.description || "",
                    image: image
                };
            });

        return Response.json(items);

    } catch (err) {
        console.error("ERROR:", err);
        return Response.json({ error: "Kan RSS niet ophalen" }, { status: 500 });
    }
}
