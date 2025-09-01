/**
 * Script to check if the sitemap.xml file is being served correctly
 */

const https = require('https');

// Function to fetch a URL and return the response
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

   

      // A chunk of data has been received
      res.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received
      res.on('end', () => {
        resolve(data);
      });

    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Main function
async function main() {
  try {
    const sitemapData = await fetchUrl('https://rachanaboutique.in/sitemap.xml');

    // Check if the response is valid XML
    if (sitemapData.includes('<urlset') && sitemapData.includes('</urlset>')) {

      // Count the number of URLs in the sitemap
      const urlCount = (sitemapData.match(/<url>/g) || []).length;

      // Check if the sitemap contains any unwanted URLs
      if (sitemapData.includes('https://rachanaboutique.in/sitemap.xml')) {
        console.warn('⚠️ Sitemap contains a reference to itself, which is not recommended');
      }

      // Check if the sitemap contains any product details URLs
      if (sitemapData.includes('/shop/details/')) {
        console.error('❌ Sitemap contains product details URLs, which should be removed');
      }

      // Check if the sitemap contains any dates in the URLs
      if (sitemapData.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)) {
        console.error('❌ Sitemap contains dates in the URLs, which is incorrect');
      }

      // Print the first URL for inspection
      const firstUrlMatch = sitemapData.match(/<url>[\s\S]*?<\/url>/m);
      if (firstUrlMatch) {
        console.log(firstUrlMatch[0]);
      }
    } else {
      console.error('❌ Sitemap.xml is not valid XML');
    }

    const robotsData = await fetchUrl('https://rachanaboutique.in/robots.txt');

    // Check if the response is valid robots.txt
    if (robotsData.includes('User-agent:') && robotsData.includes('Sitemap:')) {
    } else {
      console.error('❌ Robots.txt is not valid');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the main function
main();
