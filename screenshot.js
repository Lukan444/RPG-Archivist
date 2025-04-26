const puppeteer = require('puppeteer');

async function takeScreenshot() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    console.log('Opening new page...');
    const page = await browser.newPage();
    
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    console.log('Waiting for content to load...');
    await page.waitForSelector('body', { timeout: 5000 });
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'rpg-archivist-screenshot.png', fullPage: true });
    
    console.log('Screenshot saved to rpg-archivist-screenshot.png');
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

takeScreenshot();
