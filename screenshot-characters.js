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
    
    console.log('Navigating to http://localhost:3000/characters...');
    await page.goto('http://localhost:3000/characters', { waitUntil: 'networkidle2' });
    
    console.log('Waiting for content to load...');
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Wait a bit more to ensure everything is loaded
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'rpg-archivist-characters.png', fullPage: true });
    
    console.log('Screenshot saved to rpg-archivist-characters.png');
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

takeScreenshot();
