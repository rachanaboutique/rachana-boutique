/**
 * Script to check if the sitemap.xml file is being served correctly
 */

const https = require('https');

// Function to fetch a URL and return the response
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      // Log the status code
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Content-Type: ${res.headers['content-type']}`);

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
    console.log('Checking sitemap.xml...');
    const sitemapData = await fetchUrl('https://rachanaboutique.in/sitemap.xml');

    // Check if the response is valid XML
    if (sitemapData.includes('<urlset') && sitemapData.includes('</urlset>')) {
      console.log('✅ Sitemap.xml is valid XML');

      // Count the number of URLs in the sitemap
      const urlCount = (sitemapData.match(/<url>/g) || []).length;
      console.log(`📊 Sitemap contains ${urlCount} URLs`);

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
        console.log('\nSample URL entry:');
        console.log(firstUrlMatch[0]);
      }
    } else {
      console.error('❌ Sitemap.xml is not valid XML');
      console.log('First 200 characters of response:');
      console.log(sitemapData.substring(0, 200) + '...');
    }

    console.log('\nChecking robots.txt...');
    const robotsData = await fetchUrl('https://rachanaboutique.in/robots.txt');

    // Check if the response is valid robots.txt
    if (robotsData.includes('User-agent:') && robotsData.includes('Sitemap:')) {
      console.log('✅ Robots.txt is valid');
    } else {
      console.error('❌ Robots.txt is not valid');
      console.log('First 200 characters of response:');
      console.log(robotsData.substring(0, 200) + '...');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the main function
main();
