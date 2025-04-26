// Puppeteer navigation script for RPG Archivist
const puppeteer = require('puppeteer');

async function navigateAndCapture() {
  console.log('Starting Puppeteer navigation and screenshot capture...');
  
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
    
    // Helper function to navigate and take screenshot
    async function navigateAndScreenshot(url, screenshotName) {
      console.log(`Navigating to ${url}...`);
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 60000 
      });
      console.log(`Navigation to ${url} complete`);
      
      // Wait for a moment to ensure the page is fully loaded
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Take a screenshot
      console.log(`Taking screenshot of ${screenshotName}...`);
      await page.screenshot({ 
        path: `${screenshotName}.png`, 
        fullPage: true 
      });
      console.log(`Screenshot saved to ${screenshotName}.png`);
    }
    
    // Navigate to different pages and take screenshots
    await navigateAndScreenshot('http://localhost:3000', 'home-page');
    await navigateAndScreenshot('http://localhost:3000/login', 'login-page');
    
    // Login with mock credentials
    console.log('Attempting to login...');
    await page.type('input[name="email"]', 'dev@example.com');
    await page.type('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Wait for navigation after login
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('Login attempt complete');
    
    // Take screenshot after login
    await page.screenshot({ 
      path: 'after-login.png', 
      fullPage: true 
    });
    console.log('Screenshot saved to after-login.png');
    
    // Navigate to other pages if login was successful
    await navigateAndScreenshot('http://localhost:3000/campaigns', 'campaigns-page');
    await navigateAndScreenshot('http://localhost:3000/characters', 'characters-page');
    await navigateAndScreenshot('http://localhost:3000/worlds', 'worlds-page');
    await navigateAndScreenshot('http://localhost:3000/sessions', 'sessions-page');
    await navigateAndScreenshot('http://localhost:3000/settings', 'settings-page');
    
    console.log('Navigation and screenshot capture completed successfully');
  } catch (error) {
    console.error('Error during Puppeteer navigation:', error);
  } finally {
    // Always close the browser
    if (browser) {
      await browser.close();
      console.log('Browser closed');
    }
  }
}

// Run the function
navigateAndCapture();
