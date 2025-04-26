const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.resolve(__dirname, '../../screenshots/ui-changes');
console.log('Screenshots will be saved to:', screenshotsDir);
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// UI elements to capture
const uiElements = [
  { 
    name: 'navigation-drawer', 
    url: 'http://localhost:3001/dashboard', 
    selector: '.MuiDrawer-paper',
    fullPage: false
  },
  { 
    name: 'dashboard-with-theme', 
    url: 'http://localhost:3001/dashboard', 
    selector: 'main',
    fullPage: true
  },
  { 
    name: 'login-page', 
    url: 'http://localhost:3001/login', 
    selector: 'body',
    fullPage: true
  }
];

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Take screenshots of UI elements
    console.log('Taking screenshots of UI elements...');
    for (const { name, url, selector, fullPage } of uiElements) {
      console.log(`Navigating to ${url} to capture ${name}...`);
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Wait for the element to be visible
      await page.waitForSelector(selector, { visible: true, timeout: 5000 });
      
      // Wait a bit for animations to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (fullPage) {
        // Take full page screenshot
        const screenshotPath = path.join(screenshotsDir, `${name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Full page screenshot saved to ${screenshotPath}`);
      } else {
        // Take screenshot of specific element
        const element = await page.$(selector);
        if (element) {
          const screenshotPath = path.join(screenshotsDir, `${name}.png`);
          await element.screenshot({ path: screenshotPath });
          console.log(`Element screenshot saved to ${screenshotPath}`);
        } else {
          console.warn(`Element with selector "${selector}" not found`);
        }
      }
    }
    
    // Try to log in and capture dashboard elements
    console.log('Logging in to capture dashboard elements...');
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle2' });
    
    // Check if login form exists
    const emailInput = await page.$('input[name="email"]');
    if (emailInput) {
      // Fill in the login form
      await page.type('input[name="email"]', 'test@example.com');
      await page.type('input[name="password"]', 'password123');
      
      // Click the login button
      await page.click('button[type="submit"]');
      
      // Wait for navigation to complete
      try {
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 });
        
        // Capture dashboard elements
        const dashboardElements = [
          { name: 'worlds-page', url: 'http://localhost:3001/rpg-worlds', selector: 'main' },
          { name: 'campaigns-page', url: 'http://localhost:3001/campaigns', selector: 'main' },
          { name: 'characters-page', url: 'http://localhost:3001/characters', selector: 'main' }
        ];
        
        for (const { name, url, selector } of dashboardElements) {
          console.log(`Navigating to ${url} to capture ${name}...`);
          await page.goto(url, { waitUntil: 'networkidle2' });
          
          // Wait for the element to be visible
          await page.waitForSelector(selector, { visible: true, timeout: 5000 });
          
          // Wait a bit for animations to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Take screenshot
          const screenshotPath = path.join(screenshotsDir, `${name}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true });
          console.log(`Screenshot saved to ${screenshotPath}`);
        }
      } catch (error) {
        console.warn('Login may have failed or timed out:', error.message);
      }
    } else {
      console.warn('Login form not found');
    }
    
    console.log('All screenshots taken successfully!');
  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
})();
