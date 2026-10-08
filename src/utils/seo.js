/**
 * SEO & OpenGraph Helper
 * Updates document meta tags, OpenGraph cards, Twitter Cards, and Schema.org JSON-LD
 */

const DEFAULT_SEO = {
  title: 'Snellum | Premium Dating & Connections in Malawi',
  description: 'Meet verified singles, discover curated speed-dating mixers, and find meaningful connections. Join Snellum today.',
  image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&h=630&fit=crop&q=80',
  url: window.location.origin,
  type: 'website',
};

export function updateSeoMeta({
  title = DEFAULT_SEO.title,
  description = DEFAULT_SEO.description,
  image = DEFAULT_SEO.image,
  url = window.location.href,
  type = DEFAULT_SEO.type,
  structuredData = null,
} = {}) {
  // 1. Update Title
  document.title = title.includes('Snellum') ? title : `${title} | Snellum`;

  // 2. Helper to set or create meta tags
  const setMeta = (attrName, attrValue, content) => {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 3. Standard Description
  setMeta('name', 'description', description);

  // 4. OpenGraph tags
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:image', image);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:type', type);
  setMeta('property', 'og:site_name', 'Snellum Dating');

  // 5. Twitter Card tags
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', image);

  // 6. Canonical link
  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', url);

  // 7. Structured Data (JSON-LD)
  let scriptEl = document.getElementById('dynamic-jsonld');
  if (structuredData) {
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'dynamic-jsonld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(structuredData);
  } else if (scriptEl) {
    scriptEl.remove();
  }
}
