import { Page } from "playwright";
import { Logger } from "../utils/logger";

export class VariantEngine {
  constructor(private page: Page) {}

  async getVariants() {
    Logger.info("Detecting variants");

    // Wait until at least one variant appears
    await this.page.waitForFunction(() => {
      return (
        document.querySelectorAll('li[id^="variant-"]').length > 0 ||
        document.querySelectorAll('a[href*="/used-"] span').length > 0
      );
    }, { timeout: 20000 });

    let variants: {
      variant: string;
      href: string | null;
    }[] = [];

    // =========================
    // OLD CASHIFY LAYOUT
    // =========================

    const oldLayoutCount =
      await this.page.locator(
        'li[id^="variant-"]'
      ).count();

    if (oldLayoutCount > 0) {
      Logger.info(
        `Using OLD variant layout (${oldLayoutCount} variants)`
      );

      variants = await this.page
        .locator('li[id^="variant-"]')
        .evaluateAll((elements) => {
          return elements.map((el: any) => ({
            variant:
              el.querySelector("span")
                ?.innerText
                ?.trim() || "",

            href:
              el.querySelector("a")
                ?.getAttribute("href") || null,
          }));
        });
    }

    // =========================
    // NEW CASHIFY LAYOUT
    // =========================

    else {
      Logger.info("Using NEW variant layout");

      variants = await this.page
        .locator('a[href*="/used-"]')
        .evaluateAll((elements) => {
          return elements
            .map((el: any) => ({
              variant:
                el.querySelector("span")
                  ?.innerText
                  ?.trim() || "",

              href:
                el.getAttribute("href"),
            }))
            .filter(
              (v: any) =>
                v.variant &&
                v.variant.length > 0
            );
        });
    }

    // Remove duplicates

    const uniqueVariants =
      variants.filter(
        (v, index, self) =>
          index ===
          self.findIndex(
            x =>
              x.variant === v.variant
          )
      );

    console.log(
      "📦 VARIANTS FOUND:",
      uniqueVariants
    );

    Logger.success(
      `${uniqueVariants.length} variants found`
    );

    return uniqueVariants;
  }
}