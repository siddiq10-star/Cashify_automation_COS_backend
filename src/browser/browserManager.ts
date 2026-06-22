import { chromium, Page } from "playwright";
import fs from "fs";
import path from "path";

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

    const sessionPath = path.resolve(
      process.cwd(),
      "storage",
      "cashify-session.json"
    );

    console.log(
      "LOADING SESSION FROM:",
      sessionPath
    );

    const hasSession =
      fs.existsSync(sessionPath);

    console.log(
      "SESSION EXISTS:",
      hasSession
    );

    const context =
      await browser.newContext({

        viewport: null,

        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136.0.0.0 Safari/537.36",

        ...(hasSession && {
          storageState: sessionPath,
        }),
      });

    const cookies =
      await context.cookies();

    const authCookie =
      cookies.find(
        c => c.name === "_cs__user_auth__v1"
      );

    console.log(
      "AUTH COOKIE FOUND:",
      !!authCookie
    );

    const page =
      await context.newPage();

    return page;
  }
}