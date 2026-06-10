import { chromium } from "playwright";

(async () => {

  const browser =
    await chromium.launch({
      headless: false,
    });

  const context =
    await browser.newContext();

  const page =
    await context.newPage();

  await page.goto(
    "https://www.cashify.in"
  );

  console.log(
    "Login manually and then press Resume in Playwright Inspector"
  );

  await page.pause();

  await context.storageState({
    path:
      "storage/cashify-session.json",
  });

  console.log(
    "✅ Session Saved"
  );

  await browser.close();

})();