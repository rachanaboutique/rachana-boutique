/**
 * Sitemap Generator for Rachana Boutique
 *
 * This script generates a sitemap.xml file for better SEO and search engine indexing.
 * It includes:
 * - SEO-friendly URLs for all category pages (/shop/collections/[slug])
 * - Product detail pages
 * - Static pages
 *
 * The sitemap helps search engines discover and index all pages on the website,
 * improving search visibility and rankings.
 */

const { writeFileSync } = require("fs");
const { SitemapStream, streamToPromise } = require("sitemap");
const axios = require('axios');
const { categoryMapping } = require('./category-mapping.cjs');

const hostname = "https://rachanaboutique.in";
const backendUrl = process.env.VITE_BACKEND_URL || "http://localhost:8000/api/v1";

// Static pages with improved priorities and frequencies
const pages = [
  { url: "/", changefreq: "daily", priority: 1.0, lastmod: new Date().toISOString() },
  { url: "/shop/home", changefreq: "daily", priority: 1.0, lastmod: new Date().toISOString() },
  { url: "/shop/collections", changefreq: "daily", priority: 0.9, lastmod: new Date().toISOString() },
  { url: "/shop/new-arrivals", changefreq: "daily", priority: 0.9, lastmod: new Date().toISOString() },
  { url: "/shop/contact", changefreq: "monthly", priority: 0.7, lastmod: new Date().toISOString() },
  { url: "/shop/search", changefreq: "weekly", priority: 0.8, lastmod: new Date().toISOString() },
];

// Sample product IDs - in a real implementation, you would fetch these from your API
const sampleProductIds = [
  "67a4d0deb03c04a4eaa7d75f",
  "67a4d1a0b03c04a4eaa7d761",
  "67a4d2a5b03c04a4eaa7d763",
  "67a4d3a0b03c04a4eaa7d765",
  "67a4d4a0b03c04a4eaa7d767",
  "67a4d5a0b03c04a4eaa7d769",
  "67a4d6a0b03c04a4eaa7d76b",
  "67a4d7a0b03c04a4eaa7d76d",
  "67a4d8a0b03c04a4eaa7d76f",
  "67a4d9a0b03c04a4eaa7d771"
];

// Add category pages to the sitemap with SEO-friendly URLs
categoryMapping.forEach((category) => {
  // Add the SEO-friendly category page
  pages.push({
    url: `/shop/collections/${category.slug}`,
    changefreq: "daily",
    priority: 0.9,
    lastmod: new Date().toISOString(),
    links: [
      {
        lang: 'en',
        url: `${hostname}/shop/collections/${category.slug}`
      }
    ]
  });
});

// Function to fetch all products from the API
async function fetchAllProducts() {
  try {
    console.log('Attempting to fetch products from API...');
    const response = await axios.get(`${backendUrl}/shop/products/get`);
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    console.log('No products found or invalid response format, using sample data');
    return [];
  } catch (error) {
    console.error('Error fetching products:', error.message);
    console.log('Using sample product IDs as fallback');
    return [];
  }
}

(async () => {
  try {
    // Try to fetch real products from API
    let products = await fetchAllProducts();
    let productIds = [];

    // If we couldn't get products from the API, use the sample IDs
    if (products.length === 0) {
      productIds = sampleProductIds;
      console.log(`Using ${productIds.length} sample product IDs`);
    } else {
      // Extract product IDs from the API response
      productIds = products.map(product => product._id);
      console.log(`Found ${productIds.length} products from API`);
    }

    // Add product detail pages to the sitemap
    productIds.forEach(productId => {
      pages.push({
        url: `/shop/details/${productId}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString()
      });
    });

    // Add sitemap index page
    pages.push({
      url: '/sitemap.xml',
      changefreq: 'weekly',
      priority: 0.5,
      lastmod: new Date().toISOString()
    });

    const sitemap = new SitemapStream({ hostname });

    // Write all pages to the sitemap
    pages.forEach((page) => sitemap.write(page));
    sitemap.end();

    const sitemapXml = await streamToPromise(sitemap).then((data) => data.toString());
    // Write to both public and dist directories to ensure it's available during development and after build
    writeFileSync("./public/sitemap.xml", sitemapXml);

    // Create dist directory if it doesn't exist
    const { existsSync, mkdirSync } = require('fs');
    if (!existsSync('./dist')) {
      mkdirSync('./dist', { recursive: true });
    }

    // Also write to dist directory for Firebase deployment
    writeFileSync("./dist/sitemap.xml", sitemapXml);
    console.log("✅ Sitemap generated successfully in both public/ and dist/ directories!");

    // Log the total number of URLs in sitemap
    console.log(`📊 Total URLs in sitemap: ${pages.length}`);
    console.log(`   - Static pages: ${6}`); // Update this number if you change the static pages
    console.log(`   - SEO-friendly category pages: ${categoryMapping.length}`);
    console.log(`   - Product pages: ${productIds.length}`);
    console.log(`   - Additional pages: 1`); // sitemap.xml
    console.log(`\n🔍 SEO-friendly URLs are now being used for better search engine visibility`);
    console.log(`🌐 All category pages now use the format: /shop/collections/[slug]`);
  } catch (error) {
    console.error("❌ Error generating sitemap:", error);
  }
})();
