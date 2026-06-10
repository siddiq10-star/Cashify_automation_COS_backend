import { Page } from "playwright";
import { Logger } from "../utils/logger";

export class QuestionEngine {

  constructor(private page: Page) {}

  async answerAllQuestions() {

    Logger.info("Answering Questions");

    // wait for questions
   try {

  await this.page.waitForSelector(
    "div.body2.body4",
    { timeout: 15000 }
  );

} catch (error) {

  console.log(
    "❌ QUESTIONS NOT FOUND"
  );

  console.log(
    "CURRENT URL:",
    this.page.url()
  );

  console.log(
    "PAGE TITLE:",
    await this.page.title()
  );

  await this.page.screenshot({
    path: `question-failure-${Date.now()}.png`,
    fullPage: true,
  });

  throw error;
}

    // Find every YES text
    const yesTexts = this.page.locator(
      'div.body2.body4'
    ).filter({
      hasText: /^Yes$/,
    });

    const count = await yesTexts.count();

    Logger.info(
      `Found ${count} YES options`
    );

    for (let i = 0; i < count; i++) {

      try {

        const yesText =
          yesTexts.nth(i);

        // click parent card, not text
        const yesCard =
          yesText.locator(
            "xpath=ancestor::div[contains(@class,'cursor-pointer')][1]"
          );

        await yesCard.click({
          force: true,
        });

        await this.page.waitForTimeout(
          500
        );

      } catch (err) {

        console.log(
          `Failed YES ${i + 1}`
        );
      }

    }
    Logger.success("Questions completed");

    // eSIM question
    const singleEsim =
      this.page.locator(
        'div.body2.body4'
      ).filter({
        hasText: "Single eSIM",
      }).first();

    if (await singleEsim.count()) {

      const esimCard =
        singleEsim.locator(
          "xpath=ancestor::div[contains(@class,'cursor-pointer')][1]"
        );

      await esimCard.click({
        force: true,
      });

      Logger.success(
        "Selected Single eSIM"
      );
    }

    await this.page.waitForTimeout(1500);

    const continueBtn =
      this.page.locator(
        'button:has-text("Continue")'
      ).first();

    await continueBtn.click({
      force: true,
    });

    Logger.success(
      "Continue Clicked"
    );

    await this.page.waitForTimeout(
      5000
    );
  }
}