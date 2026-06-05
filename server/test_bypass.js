const puppeteerCore = require("puppeteer-core");
const { addExtra } = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

const puppeteer = addExtra(puppeteerCore);
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true, // try new headless if supported? or just true
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  
  // No custom User-Agent, let stealth plugin handle it
  // Wait for the redirect
  
  try {
    console.log("Navigating...");
    await page.goto("https://graitek.great-site.net/?i=3", { waitUntil: "domcontentloaded" });
    
    console.log("Waiting 10s for challenge...");
    await new Promise(r => setTimeout(r, 10000));
    
    const content = await page.content();
    if (content.includes("Cookies are not enabled")) {
      console.log("Failed! Still showing cookies error.");
    } else {
      console.log("Success! Page loaded properly.");
      console.log(content.substring(0, 500));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
