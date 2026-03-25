<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nieuws Widget</title>
<style>
  body {
    font-family: Arial, sans-serif;
  }

  .news-widget {
    width: 100%;
    max-width: 960px;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    background-color: #f9f9f9;
    box-sizing: border-box;
  }

  .news-widget h2 {
    font-size: 1.4em;
    margin-bottom: 15px;
    text-align: center;
  }

  #news-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }

  .news-item {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    min-height: 200px;
  }

  .news-item a {
    text-decoration: none;
    color: #0077cc;
    font-weight: bold;
    margin-bottom: 5px;
  }

  .news-item a:hover {
    text-decoration: underline;
  }

  .news-description {
    font-size: 0.85em;
    color: #555;
    margin-top: 5px;
  }

  .news-image {
    max-width: 100%;
    border-radius: 4px;
    margin: 5px 0;
    object-fit: cover;
    height: 120px;
  }

  /* Responsive */
  @media (max-width: 800px) {
    #news-container {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 500px) {
    #news-container {
      grid-template-columns: 1fr;
    }
  }

</style>
</head>
<body>

<div class="news-widget">
  <h2>Laatste Nieuws</h2>
  <div id="news-container"></div>
</div>

<script>
async function loadNews() {
  try {
    const response = await fetch('https://news-p21a.vercel.app/api/rss');
    const articles = await response.json();

    const container = document.getElementById('news-container');
    container.innerHTML = '';

    articles.slice(0, 6).forEach(article => {
      const item = document.createElement('div');
      item.className = 'news-item';

      // Haal afbeelding uit description als <img> aanwezig
      let imgHtml = '';
      const imgMatch = article.description.match(/<img.*?src="(.*?)"/);
      if (imgMatch && imgMatch[1]) {
        imgHtml = `<img src="${imgMatch[1]}" alt="${article.title}" class="news-image">`;
      }

      item.innerHTML = `
        <a href="${article.link}" target="_blank">${article.title}</a>
        ${imgHtml}
        <div class="news-description">${article.description.replace(/<img.*?>/g, '')}</div>
      `;
      container.appendChild(item);
    });
  } catch (err) {
    console.error('Kan nieuws niet laden:', err);
    document.getElementById('news-container').innerHTML = 'Kan nieuws niet laden.';
  }
}

loadNews();
</script>

</body>
</html>
