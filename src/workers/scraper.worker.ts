import { BrowserManager } from "../browser/browserManager";
import { CashifyEngine } from "../engines/cashify.engine";

export class ScraperWorker {

  static async run(
  model: string,
  variant?: string,
  rowIndex?: number,
  jobId?: string
) {

    let page: any = null;

    try {

      console.log("🔍 Starting:", model);

      const browserManager =
        new BrowserManager();

      page =
        await browserManager.start();

      const engine =
        new CashifyEngine(page);

      const result =
  await engine.getPrice(
  model,
  variant,
  rowIndex,
  jobId
);

      await page.close();

      return result;

    } catch (err: any) {

      console.log(
        "❌ SCRAPER ERROR:",
        err
      );

      if (page) {
        try {
          await page.close();
        } catch {}
      }

      return {
        model,
        status: "failed",
        error: err.message,
      };
    }
  }
}