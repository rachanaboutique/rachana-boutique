
import { writeFileSync } from "fs";
import { SitemapStream, streamToPromise } from "sitemap";

const hostname = "https://rachanaboutique.in";

// Static pages
const pages = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/shop/home", changefreq: "daily", priority: 0.9 },
  { url: "/shop/collections", changefreq: "weekly", priority: 0.8 },
  { url: "/shop/new-arrivals", changefreq: "weekly", priority: 0.8 },
  { url: "/shop/checkout", changefreq: "monthly", priority: 0.7 },
  { url: "/shop/account", changefreq: "monthly", priority: 0.6 },
  { url: "/shop/search", changefreq: "weekly", priority: 0.7 },
  { url: "/shop/contact", changefreq: "monthly", priority: 0.5 },
  { url: "/auth/login", changefreq: "monthly", priority: 0.6 },
  { url: "/auth/register", changefreq: "monthly", priority: 0.6 },
];

// Category pages with their IDs and names
const categories = [
  {
    id: "67a4cedeb03c04a4eaa7d75d",
    name: "Tussars",
    priority: 0.9,
    changefreq: "daily"
  },
  {
    id: "67a702e745c9ad11e043ca74",
    name: "Banaras",
    priority: 0.9,
    changefreq: "daily"
  },
  {
    id: "67a4e2b19baa2e6f977087a3",
    name: "Cotton",
    priority: 0.9,
    changefreq: "daily"
  },
  {
    id: "67ae15fcee205890c3cd5f98",
    name: "Organza",
    priority: 0.9,
    changefreq: "daily"
  },
  {
    id: "67ae17d5ee205890c3cd5faf",
    name: "Kora",
    priority: 0.9,
    changefreq: "daily"
  },
  {
    id: "67ae2128ee205890c3cd6251",
    name: "Celebrity Collection",
    priority: 0.9,
    changefreq: "daily"
  }
];

// Add category pages to the sitemap
categories.forEach((category) => {
  // Add the category collection page
  pages.push({
    url: `/shop/collections?category=${category.id}`,
    changefreq: category.changefreq,
    priority: category.priority,
    // Add additional metadata for better SEO
    lastmod: new Date().toISOString(),
    // Add language tags if your site supports multiple languages
    links: [
      {
        lang: 'en',
        url: `${hostname}/shop/collections?category=${category.id}`
      }
    ]
  });
});

(async () => {
  try {
    const sitemap = new SitemapStream({ hostname });
    
    // Write all pages to the sitemap
    pages.forEach((page) => sitemap.write(page));
    sitemap.end();

    const sitemapXml = await streamToPromise(sitemap).then((data) => data.toString());
    writeFileSync("./public/sitemap.xml", sitemapXml);
    console.log("✅ Sitemap generated successfully with all category pages!");
    
    // Log the total number of URLs in sitemap
    console.log(`📊 Total URLs in sitemap: ${pages.length}`);
  } catch (error) {
    console.error("❌ Error generating sitemap:", error);
  }
})();