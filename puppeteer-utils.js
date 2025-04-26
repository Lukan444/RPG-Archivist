/**
 * Puppeteer Utilities for RPG Archivist
 *
 * This script provides utility functions for navigating and testing the RPG Archivist application
 * using Puppeteer. It can be used to:
 *
 * 1. Take screenshots of different pages
 * 2. Test navigation flows
 * 3. Verify UI elements
 * 4. Test form submissions
 *
 * Usage:
 * node puppeteer-utils.js [command] [options]
 *
 * Commands:
 * - screenshot: Take screenshots of specified pages
 * - navigate: Navigate through the application
 * - test-login: Test the login functionality
 * - test-ui: Test UI elements
 */

const puppeteer = require('puppeteer');

// Configuration
const config = {
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:4000',
  headless: false,
  viewportWidth: 1280,
  viewportHeight: 800,
  screenshotDir: './screenshots',
  waitTimeout: 60000,
  defaultWaitTime: 2000,
  mockCredentials: {
    email: 'dev@example.com',
    password: 'password'
  }
};

// Main pages in the application
const pages = {
  home: '/',
  login: '/login',
  register: '/register',
  campaigns: '/campaigns',
  characters: '/characters',
  worlds: '/worlds',
  sessions: '/sessions',
  settings: '/settings',
  profile: '/profile',
  brain: '/brain'
};

/**
 * Launch a browser instance
 * @returns {Promise<Browser>} Puppeteer browser instance
 */
async function launchBrowser() {
  console.log('Launching browser...');

  const browser = await puppeteer.launch({
    headless: config.headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ],
    defaultViewport: {
      width: config.viewportWidth,
      height: config.viewportHeight
    }
  });

  console.log('Browser launched successfully');
  return browser;
}

/**
 * Navigate to a URL and take a screenshot
 * @param {Page} page - Puppeteer page instance
 * @param {string} url - URL to navigate to
 * @param {string} screenshotName - Name for the screenshot file
 */
async function navigateAndScreenshot(page, url, screenshotName) {
  console.log(`Navigating to ${url}...`);

  try {
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: config.waitTimeout
    });
    console.log(`Navigation to ${url} complete`);

    // Wait for a moment to ensure the page is fully loaded
    await new Promise(resolve => setTimeout(resolve, config.defaultWaitTime));

    // Take a screenshot
    console.log(`Taking screenshot of ${screenshotName}...`);
    await page.screenshot({
      path: `${config.screenshotDir}/${screenshotName}.png`,
      fullPage: true
    });
    console.log(`Screenshot saved to ${config.screenshotDir}/${screenshotName}.png`);
  } catch (error) {
    console.error(`Error navigating to ${url}:`, error);
  }
}

/**
 * Login to the application
 * @param {Page} page - Puppeteer page instance
 * @param {Object} credentials - Login credentials
 */
async function login(page, credentials = config.mockCredentials) {
  console.log('Attempting to login...');

  try {
    // Navigate to login page
    await page.goto(`${config.baseUrl}/login`, {
      waitUntil: 'networkidle2',
      timeout: config.waitTimeout
    });

    // Fill in login form
    await page.type('input[name="email"]', credentials.email);
    await page.type('input[name="password"]', credentials.password);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('Login attempt complete');

    // Take screenshot after login
    await page.screenshot({
      path: `${config.screenshotDir}/after-login.png`,
      fullPage: true
    });
    console.log(`Screenshot saved to ${config.screenshotDir}/after-login.png`);

    // Check if login was successful
    const url = page.url();
    const isLoggedIn = !url.includes('/login');
    console.log(`Login ${isLoggedIn ? 'successful' : 'failed'}`);

    return isLoggedIn;
  } catch (error) {
    console.error('Error during login:', error);
    return false;
  }
}

/**
 * Take screenshots of all main pages
 */
async function screenshotAllPages() {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  try {
    // Create screenshots directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(config.screenshotDir)) {
      fs.mkdirSync(config.screenshotDir);
    }

    // Take screenshots of public pages
    await navigateAndScreenshot(page, `${config.baseUrl}${pages.home}`, 'home-page');
    await navigateAndScreenshot(page, `${config.baseUrl}${pages.login}`, 'login-page');
    await navigateAndScreenshot(page, `${config.baseUrl}${pages.register}`, 'register-page');

    // Login and take screenshots of authenticated pages
    const isLoggedIn = await login(page);

    if (isLoggedIn) {
      await navigateAndScreenshot(page, `${config.baseUrl}${pages.campaigns}`, 'campaigns-page');
      await navigateAndScreenshot(page, `${config.baseUrl}${pages.characters}`, 'characters-page');
      await navigateAndScreenshot(page, `${config.baseUrl}${pages.worlds}`, 'worlds-page');
      await navigateAndScreenshot(page, `${config.baseUrl}${pages.sessions}`, 'sessions-page');
      await navigateAndScreenshot(page, `${config.baseUrl}${pages.settings}`, 'settings-page');
      await navigateAndScreenshot(page, `${config.baseUrl}${pages.profile}`, 'profile-page');
      await navigateAndScreenshot(page, `${config.baseUrl}${pages.brain}`, 'brain-page');
    }
  } catch (error) {
    console.error('Error during screenshot capture:', error);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

/**
 * Test the login functionality
 */
async function testLogin() {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  try {
    // Test successful login
    const isLoggedIn = await login(page);
    console.log(`Login test ${isLoggedIn ? 'passed' : 'failed'}`);

    // Test logout
    if (isLoggedIn) {
      console.log('Testing logout...');

      // Take screenshot of the header
      await page.screenshot({
        path: `${config.screenshotDir}/header.png`,
        clip: { x: 0, y: 0, width: config.viewportWidth, height: 100 }
      });
      console.log(`Screenshot saved to ${config.screenshotDir}/header.png`);

      // Try to find the user menu button
      const userMenuButton = await page.$('button[aria-label="account of current user"]') ||
                             await page.$('.MuiAvatar-root') ||
                             await page.$('header button:last-child');

      if (userMenuButton) {
        console.log('User menu button found, clicking...');
        await userMenuButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Take screenshot of the menu
        await page.screenshot({
          path: `${config.screenshotDir}/user-menu.png`,
          fullPage: true
        });
        console.log(`Screenshot saved to ${config.screenshotDir}/user-menu.png`);

        // Try to find the logout button by evaluating all menu items
        const logoutButton = await page.evaluateHandle(() => {
          const menuItems = Array.from(document.querySelectorAll('li, button'));
          return menuItems.find(item =>
            item.textContent.includes('Logout') ||
            item.textContent.includes('Log out') ||
            item.textContent.includes('Sign out')
          );
        });

        if (logoutButton) {
          console.log('Logout button found, clicking...');
          await logoutButton.click();
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Check if logout was successful
          const url = page.url();
          const isLoggedOut = url.includes('/login');
          console.log(`Logout ${isLoggedOut ? 'successful' : 'failed'}`);

          // Take screenshot after logout
          await page.screenshot({
            path: `${config.screenshotDir}/after-logout.png`,
            fullPage: true
          });
          console.log(`Screenshot saved to ${config.screenshotDir}/after-logout.png`);
        } else {
          console.log('Logout button not found');
        }
      } else {
        console.log('User menu button not found');
      }
    }
  } catch (error) {
    console.error('Error during login test:', error);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

/**
 * Process command line arguments and run the appropriate function
 */
function processArgs() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'screenshot':
      screenshotAllPages();
      break;
    case 'test-login':
      testLogin();
      break;
    default:
      screenshotAllPages();
      break;
  }
}

// Run the script
processArgs();
