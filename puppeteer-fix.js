// Puppeteer fix script
const puppeteer = require('puppeteer');

async function captureScreenshot() {
  console.log('Starting Puppeteer screenshot capture...');

  let browser = null;

  try {
    // Launch a new browser instance with specific options
    browser = await puppeteer.launch({
      headless: false,
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
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    console.log('Navigation complete');

    // Wait for a moment to ensure the page is fully loaded
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take a screenshot
    console.log('Taking screenshot...');
    await page.screenshot({
      path: 'app-screenshot.png',
      fullPage: true
    });
    console.log('Screenshot saved to app-screenshot.png');

    // Navigate to the login page
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3000/login', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    console.log('Navigation to login page complete');

    // Wait for a moment to ensure the page is fully loaded
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take a screenshot of the login page
    console.log('Taking login page screenshot...');
    await page.screenshot({
      path: 'login-screenshot.png',
      fullPage: true
    });
    console.log('Login screenshot saved to login-screenshot.png');

    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error during Puppeteer test:', error);
  } finally {
    // Always close the browser
    if (browser) {
      await browser.close();
      console.log('Browser closed');
    }
  }
}

// Run the function
captureScreenshot();
