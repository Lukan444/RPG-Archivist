// Simple Puppeteer test script to diagnose issues
const puppeteer = require('puppeteer');

async function testPuppeteer() {
  console.log('Starting Puppeteer test...');
  
  try {
    // Launch a new browser instance with specific options
    const browser = await puppeteer.launch({
      headless: false,  // Set to true for headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ],
      defaultViewport: { width: 1280, height: 800 }
    });
    
    console.log('Browser launched successfully');
    
    // Create a new page
    const page = await browser.newPage();
    console.log('New page created');
    
    // Navigate to the application
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Navigation complete');
    
    // Take a screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'app-screenshot.png', fullPage: true });
    console.log('Screenshot saved to app-screenshot.png');
    
    // Close the browser
    await browser.close();
    console.log('Browser closed');
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error during Puppeteer test:', error);
  }
}

testPuppeteer();
