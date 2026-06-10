import { chromium, Page } from "playwright";
import fs from "fs";

export class BrowserManager {

  async start(): Promise<Page> {

    const browser = await chromium.launch({

      headless: false,

      slowMo: 200,

      args: [
        "--disable-blink-features=AutomationControlled",
        "--start-maximized",
      ],
    });

    const hasSession =
      fs.existsSync(
        "storage/cashify-session.json"
      );

    const context =
      await browser.newContext({

        viewport: null,

        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136.0.0.0 Safari/537.36",

        ...(hasSession && {
          storageState:
            "storage/cashify-session.json",
        }),
      });

    const page =
      await context.newPage();

    return page;
  }
}