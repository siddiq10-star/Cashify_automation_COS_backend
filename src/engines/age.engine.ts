import { Page } from "playwright";
import { Logger } from "../utils/logger";

export class AgeEngine {

  constructor(private page: Page) {}

  async getAgeOptionsCount(): Promise<number> {

    try {

      const ageHeader =
        this.page.locator("#listHeader").filter({
          hasText: "What is your mobile age?",
        });

      if (!(await ageHeader.count())) {
        return 0;
      }

      const options =
        this.page.locator(
          'div.flex.flex-row.rounded-md.cursor-pointer.border'
        );

      const count =
        await options.count();

      Logger.info(
        `Age Options Found: ${count}`
      );

      return count;

    } catch {

      return 0;
    }
  }

  async getAgeLabels(): Promise<string[]> {

  try {

    const options =
      this.page.locator(
        'div.flex.flex-row.rounded-md.cursor-pointer.border'
      );

    const count =
      await options.count();

    const labels: string[] = [];

    for (
      let i = 0;
      i < count;
      i++
    ) {

      const text =
        await options
          .nth(i)
          .locator(".body4")
          .first()
          .textContent();

      labels.push(
        text?.trim() || `Age ${i + 1}`
      );
    }

    console.log(
      "📅 AGE LABELS:",
      labels
    );

    return labels;

  } catch (err) {

    console.log(
      "Age Labels Error:",
      err
    );

    return [];
  }
}

  async selectAgeOption(
    index: number
  ): Promise<boolean> {

    try {

      const options =
        this.page.locator(
          'div.flex.flex-row.rounded-md.cursor-pointer.border'
        );

      const count =
        await options.count();

      if (index >= count) {
        return false;
      }

      await options
        .nth(index)
        .click({
          force: true,
        });

      Logger.success(
        `Age Selected: ${index + 1}`
      );

      await this.page.waitForTimeout(
        3000
      );

      return true;

    } catch (err) {

      console.log(err);

      return false;
    }
  }

  async clickRecalculate() {

  try {

    Logger.info(
      "Looking for Recalculate"
    );

    const recalculate =
  this.page.locator(
    'div.cursor-pointer:has(span:text("Recalculate"))'
  ).first();

    await recalculate.waitFor({
      state: "visible",
      timeout: 15000,
    });

    console.log(
      "✅ Recalculate Visible"
    );

    await recalculate.scrollIntoViewIfNeeded();

    await this.page.waitForTimeout(
      1000
    );

    await recalculate.click({
      force: true,
    });

    console.log(
      "✅ Recalculate Click Triggered"
    );

    await this.page.waitForTimeout(
      5000
    );

    return true;

  } catch (err) {

    console.log(
      "❌ RECALCULATE ERROR:",
      err
    );

    await this.page.screenshot({
      path: "recalculate-error.png",
      fullPage: true,
    });

    return false;
  }
}
}