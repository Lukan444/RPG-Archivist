const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.resolve(__dirname, '../../screenshots/dashboard');
console.log('Screenshots will be saved to:', screenshotsDir);
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Dashboard pages to capture
const dashboardPages = [
  { name: 'dashboard', url: 'http://localhost:3000/dashboard', waitFor: 'h4' },
  { name: 'rpg-worlds', url: 'http://localhost:3000/rpg-worlds', waitFor: '.MuiCard-root' },
  { name: 'campaigns', url: 'http://localhost:3000/campaigns', waitFor: '.MuiCard-root' },
  { name: 'sessions', url: 'http://localhost:3000/sessions', waitFor: '.MuiCard-root' },
  { name: 'characters', url: 'http://localhost:3000/characters', waitFor: '.MuiCard-root' },
  { name: 'locations', url: 'http://localhost:3000/locations', waitFor: '.MuiCard-root' },
  { name: 'events', url: 'http://localhost:3000/events', waitFor: '.MuiCard-root' },
  { name: 'timeline', url: 'http://localhost:3000/timeline', waitFor: 'h4' },
  { name: 'mind-map', url: 'http://localhost:3000/mind-map', waitFor: 'h4' },
  { name: 'brain', url: 'http://localhost:3000/brain', waitFor: 'h4' },
  { name: 'storytelling', url: 'http://localhost:3000/storytelling', waitFor: 'h4' },
  { name: 'content-analysis', url: 'http://localhost:3000/content-analysis', waitFor: 'h4' },
  { name: 'proposals', url: 'http://localhost:3000/proposals', waitFor: 'h4' },
  { name: 'search', url: 'http://localhost:3000/search', waitFor: 'input' },
  { name: 'profile', url: 'http://localhost:3000/profile', waitFor: 'form' },
  { name: 'settings', url: 'http://localhost:3000/settings', waitFor: 'h4' },
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
    // Login first
    console.log('Logging in...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    
    // Wait for the login form to appear
    await page.waitForSelector('input[name="email"]');
    
    // Fill in the login form
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="password"]', 'password123');
    
    // Click the login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    // Take screenshots of dashboard pages
    console.log('Taking screenshots of dashboard pages...');
    for (const { name, url, waitFor } of dashboardPages) {
      console.log(`Navigating to ${name}...`);
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      try {
        await page.waitForSelector(waitFor, { timeout: 5000 });
      } catch (error) {
        console.warn(`Warning: Could not find selector "${waitFor}" on page "${name}"`);
      }
      
      // Wait a bit for animations to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Take screenshot
      const screenshotPath = path.join(screenshotsDir, `${name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved to ${screenshotPath}`);
    }
    
    console.log('All screenshots taken successfully!');
  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
})();
