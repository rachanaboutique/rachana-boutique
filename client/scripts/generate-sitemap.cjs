const fs = require('fs');
const { categoryMapping } = require('./category-mapping.cjs');

const hostname = "https://rachanaboutique.in";

// Function to generate the sitemap XML
function generateSitemap() {
  // Start the XML document
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  // Static pages
  const staticPages = [
    // Root URL removed to avoid duplicate content
    { url: "/shop/home", changefreq: "daily", priority: 1.0 },
    { url: "/shop/collections", changefreq: "daily", priority: 0.99 },
    { url: "/shop/new-arrivals", changefreq: "daily", priority: 0.98 },
    { url: "/shop/contact", changefreq: "monthly", priority: 0.7 },
    { url: "/shop/search", changefreq: "weekly", priority: 0.8 },
  ];

  // Add static pages to the sitemap
  staticPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${hostname}${page.url}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // Define the order of categories for SEO
  const orderedCategories = [
    { slug: 'celebrity-collection', priority: 0.95 },
    { slug: 'banaras-sarees', priority: 0.94 },
    { slug: 'cotton-sarees', priority: 0.93 },
    { slug: 'tussar-sarees', priority: 0.92 },
    { slug: 'organza-sarees', priority: 0.91 },
    { slug: 'georgette-sarees', priority: 0.90 }
  ];

  // Add category pages to the sitemap in the specified order with custom priorities
  orderedCategories.forEach(orderedCat => {
    const category = categoryMapping.find(cat => cat.slug === orderedCat.slug);
    if (category) {
      xml += '  <url>\n';
      xml += `    <loc>${hostname}/shop/collections/${category.slug}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>${orderedCat.priority}</priority>\n`;
      xml += '  </url>\n';
    }
  });

  // Close the XML document
  xml += '</urlset>';

  return xml;
}

// Main function
function main() {
  try {
    // Generate the sitemap
    const sitemap = generateSitemap();

    // Write to public directory
    fs.writeFileSync('./public/sitemap.xml', sitemap);
    console.log('✅ Sitemap generated successfully in public directory');

    // Create dist directory if it doesn't exist
    if (!fs.existsSync('./dist')) {
      fs.mkdirSync('./dist', { recursive: true });
    }

    // Write to dist directory
    fs.writeFileSync('./dist/sitemap.xml', sitemap);
    console.log('✅ Sitemap generated successfully in dist directory');

    // Log the number of URLs in the sitemap
    const urlCount = (sitemap.match(/<url>/g) || []).length;
    console.log(`📊 Total URLs in sitemap: ${urlCount}`);
    console.log(`   - Static pages: ${6}`);
    console.log(`   - Category pages: ${categoryMapping.length}`);

    // Validate the XML
    if (sitemap.includes('<urlset') && sitemap.includes('</urlset>')) {
      console.log('\n🔍 Sitemap is valid XML');
    } else {
      console.error('\n❌ Sitemap is not valid XML');
    }
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
  }
}

// Run the main function
main();
