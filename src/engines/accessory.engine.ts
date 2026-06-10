import { Page } from "playwright";
import { Logger } from "../utils/logger";

export class AccessoryEngine {

  constructor(private page: Page) {}

  async selectAccessories() {

    Logger.info(
      "Selecting Available Accessories"
    );

    // Wait for accessories page

    await this.page.locator(
      '#listHeader'
    ).filter({
      hasText: "Do you have the following?"
    }).waitFor({
      state: "visible",
      timeout: 15000,
    });

    // Find all accessory cards

    const cards = this.page.locator(
      'div.cursor-pointer.flex.flex-col.items-center.rounded-md'
    );

    const count = await cards.count();

    console.log(
      `📦 Accessories Found: ${count}`
    );

    // Click every available accessory

    for (let i = 0; i < count; i++) {

      try {

        await cards.nth(i).click({
          force: true,
        });

        Logger.success(
          `Accessory Selected ${i + 1}`
        );

        await this.page.waitForTimeout(
          500
        );

      } catch (err) {

        console.log(
          `⚠️ Failed Accessory ${i + 1}`
        );
      }
    }

    // Continue

    const continueBtn =
      this.page.locator(
        'button:has-text("Continue")'
      ).first();

    await continueBtn.waitFor({
      state: "visible",
      timeout: 15000,
    });

    await continueBtn.click({
      force: true,
    });

    Logger.success(
      "Accessories Continue Clicked"
    );

    await this.page.waitForTimeout(
      4000
    );
  }
}