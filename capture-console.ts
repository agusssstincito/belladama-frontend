import puppeteer from 'puppeteer';

async function captureLogs() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error(`[BROWSER PAGEERROR] ${err.toString()}`);
  });

  try {
    await page.goto('http://localhost:3000/');
    // Wait a bit for react hydration to settle
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error) {
    console.error('Error navigating:', error);
  } finally {
    await browser.close();
  }
}

captureLogs();
