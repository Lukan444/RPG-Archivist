const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.resolve(__dirname, '../../screenshots/ui-changes');
console.log('Screenshots will be saved to:', screenshotsDir);
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Pages to capture
const pages = [
  { name: 'home', url: 'http://localhost:3001' },
  { name: 'login', url: 'http://localhost:3001/login' },
  { name: 'register', url: 'http://localhost:3001/register' },
  { name: 'dashboard', url: 'http://localhost:3001/dashboard' },
  { name: 'worlds', url: 'http://localhost:3001/rpg-worlds' },
  { name: 'campaigns', url: 'http://localhost:3001/campaigns' },
  { name: 'characters', url: 'http://localhost:3001/characters' },
  { name: 'locations', url: 'http://localhost:3001/locations' },
  { name: 'events', url: 'http://localhost:3001/events' },
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
    // Take screenshots of pages
    console.log('Taking screenshots of pages...');
    for (const { name, url } of pages) {
      console.log(`Navigating to ${url}...`);
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Wait a bit for animations to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Take screenshot
      const screenshotPath = path.join(screenshotsDir, `${name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Screenshot saved to ${screenshotPath}`);
    }
    
    console.log('All screenshots taken successfully!');
  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
})();
