import { chromium } from "playwright";
import path from "path";

(async () => {

  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext();

  const page = await context.newPage();

  await page.goto(
    "https://www.cashify.in",
    {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    }
  );

  console.log(
    "LOGIN COMPLETELY THEN PRESS RESUME"
  );

  await page.pause();

  // Give Cashify a few seconds to write cookies/localStorage
  await page.waitForTimeout(5000);

  const savePath = path.resolve(
    process.cwd(),
    "storage",
    "cashify-session.json"
  );

  await context.storageState({
    path: savePath,
  });

  console.log(
    "SESSION SAVED:",
    savePath
  );

  await browser.close();

})();