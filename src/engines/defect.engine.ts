import { Page } from "playwright";
import { Logger } from "../utils/logger";

export class DefectEngine {

  constructor(private page: Page) {}

  async skipDefects() {

    // =========================
    // SCREEN/BODY DEFECT PAGE
    // =========================

    Logger.info(
      "Skipping Screen/Body Defects"
    );

    let continueBtn =
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
      "Screen/Body Continue Clicked"
    );

    await this.page.waitForTimeout(4000);

    // =========================
    // FUNCTIONAL PROBLEMS PAGE
    // =========================

    const functionalHeader =
      this.page.locator(
        '#listHeader'
      ).filter({
        hasText:
          "Functional or Physical Problems",
      });

    if (await functionalHeader.count()) {

      Logger.info(
        "Skipping Functional Problems"
      );

      continueBtn =
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
        "Functional Continue Clicked"
      );

      await this.page.waitForTimeout(
        4000
      );
    }
  }
}