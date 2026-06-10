import { Page } from "playwright";
import { Logger } from "../utils/logger";

export class PricingEngine {

  constructor(private page: Page) {}

  // =========================
  // COMMON PRICE EXTRACTOR
  // =========================
  private async extractPrice(): Promise<number | null> {

    const priceLocator = this.page
      .locator("span.display5.text-error")
      .first();

    try {

      await priceLocator.waitFor({
        state: "visible",
        timeout: 15000,
      });

      const priceText = await priceLocator.textContent();

      if (!priceText) return null;

      const price = Number(priceText.replace(/[₹,\s]/g, ""));

      if (isNaN(price)) return null;

      return price;

    } catch (err) {
      Logger.error("Price extraction failed");
      return null;
    }
  }

  // =========================
  // MAX VALUE (INITIAL LOAD)
  // =========================
  async getMaxValue(): Promise<number | null> {

    const price = await this.extractPrice();

    if (price) {
      Logger.success(`Max Value: ${price}`);
    }

    return price;
  }

  // =========================
  // WAIT FOR PRICE CHANGE
  // =========================
  private async waitForPriceChange(previous: number | null) {

    try {
      await this.page.waitForFunction(
        (prev) => {
          const el = document.querySelector("span.display5.text-error");
          const text = el?.textContent?.replace(/[₹,\s]/g, "");
          const current = Number(text);

          return current && current !== prev;
        },
        previous,
        { timeout: 15000 }
      );
    } catch {

  Logger.warn(
    "Price change wait timeout, waiting for price visibility"
  );

  await this.page.waitForSelector(
    "span.display5.text-error",
    {
      state: "visible",
      timeout: 10000,
    }
  );
}
  }

  // =========================
  // EXACT VALUE (AFTER RECALC)
  // =========================
  async getExactValue(previousValue?: number | null): Promise<number | null> {

    try {

      // IMPORTANT: wait for UI update instead of fixed timeout
      if (previousValue) {
        await this.waitForPriceChange(previousValue);
      } else {
        await this.page.waitForTimeout(3000);
      }

      let price = await this.extractPrice();

if (!price) {

  await this.page.waitForTimeout(3000);

  price = await this.extractPrice();
}

if (!price) {

  await this.page.waitForTimeout(5000);

  price = await this.extractPrice();
}

      if (price) {
        Logger.success(`Exact Value: ${price}`);
      }

      return price;

    } catch (err) {

      Logger.error("Exact value extraction failed");
      return null;
    }
  }
}