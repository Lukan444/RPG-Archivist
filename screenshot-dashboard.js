const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    console.log('Navigating to http://localhost:3000/login');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Fill in the login form
    await page.type('input[name="email"]', 'admin@rpgarchivist.com');
    await page.type('input[name="password"]', 'password123');
    
    // Click the login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    console.log('Logging in and waiting for dashboard');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
    
    console.log('Dashboard loaded, waiting for logo');
    // Wait for the logo to load
    await page.waitForSelector('img[alt="RPG Archivist Logo"]', { timeout: 10000 });
    
    console.log('Logo found, taking screenshot');
    // Take a screenshot
    await page.screenshot({ path: 'dashboard-with-new-logo.png', fullPage: true });
    
    console.log('Screenshot taken successfully!');
    
    await browser.close();
  } catch (error) {
    console.error('Error:', error);
  }
})();
