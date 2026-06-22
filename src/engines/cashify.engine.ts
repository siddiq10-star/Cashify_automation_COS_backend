import { Page } from "playwright";
import { Logger } from "../utils/logger";
import { VariantEngine } from "./variant.engine";
import { PricingEngine } from "./pricing.engine";
import { QuestionEngine } from "./question.engine";
import { DefectEngine } from "./defect.engine";
import { AccessoryEngine } from "./accessory.engine";
import { waitIfPaused }
from "../utils/jobGuard";
import { AgeEngine } from "./age.engine";
import { GoogleSheetsService }
from "../services/googleSheets.service";

export class CashifyEngine {

  constructor(private page: Page) {}

  

  async getPrice(
  model: string,
  requiredVariant?: string,
  rowIndex?: number,
  jobId?: string
){

    try {

      Logger.info(`Searching ${model}`);

      // =========================
      // OPEN CASHIFY
      // =========================

      await this.page.goto(
        "https://www.cashify.in",
        {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        }
      );

      // =========================
      // WAIT PAGE LOAD
      // =========================

      await this.page.waitForTimeout(6000);

      // =========================
      // CLICK SEARCH WRAPPER
      // =========================

      const searchWrapper = this.page.locator(
        'div.px-2.flex.flex-row.justify-center.items-center'
      ).first();

      await searchWrapper.waitFor({
        state: "visible",
        timeout: 30000,
      });

      Logger.success("Search Wrapper Found");

      await searchWrapper.click({
        force: true,
      });

      Logger.success("Wrapper Clicked");

      // =========================
      // WAIT INPUT ENABLE
      // =========================

      const activeInput = this.page.locator(
        'input[placeholder*="Search"]:not([disabled])'
      );

      await activeInput.waitFor({
        state: "visible",
        timeout: 15000,
      });

      Logger.success("Input Enabled");

      // =========================
      // CLICK INPUT
      // =========================

      await activeInput.click({
        force: true,
      });

      // =========================
      // TYPE MODEL
      // =========================

      await this.page.keyboard.type(
        model,
        {
          delay: 100,
        }
      );

      Logger.success("Typing Complete");

      // =========================
      // WAIT DROPDOWN
      // =========================

      await this.page.waitForTimeout(3000);

      // DEBUG SCREENSHOT

      await this.page.screenshot({
        path: "dropdown-debug.png",
        fullPage: true,
      });

      // =========================
      // FIND SUGGESTION TEXT
      // =========================

      const suggestionText = this.page.locator(
        'span.subtitle8.text-primary-text-dark.line-clamp-3'
      ).filter({
        hasText: model,
      }).first();

      await suggestionText.waitFor({
        state: "visible",
        timeout: 15000,
      });

      Logger.success("Suggestion Text Found");

      // =========================
      // CLICK ACTUAL ROW
      // =========================

      const clickableRow =
        suggestionText.locator(
          "xpath=ancestor::span[contains(@class,'cursor-pointer')][1]"
        );

      await clickableRow.waitFor({
        state: "visible",
        timeout: 10000,
      });

      Logger.success("Clickable Row Found");

      // JS CLICK

      await clickableRow.evaluate((el: any) => {
        el.click();
      });

      Logger.success("Suggestion Clicked");

      // =========================
      // WAIT PRODUCT PAGE
      // =========================

      await this.page.waitForTimeout(5000);


      Logger.success("Product Page Opened");
      await waitIfPaused(jobId);

      // =========================
// GET VARIANTS
// =========================

const variantEngine =
  new VariantEngine(this.page);

const variants =
  await variantEngine.getVariants();

  await waitIfPaused(jobId);

if (!variants.length) {
  throw new Error("No variants found");
}

const allVariantResults: any[] = [];

for (const currentVariant of variants) {
  try {
    
  if (requiredVariant) {

  const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace("gb", "");

const sheetVariant =
  normalize(requiredVariant);

const cashifyVariant =
  normalize(currentVariant.variant);

if (
  sheetVariant.includes(cashifyVariant)
) {
  console.log(
    "✅ MATCHED VARIANT:",
    currentVariant.variant
  );
} else {
  continue;
}

  console.log(
    "✅ MATCHED VARIANT:",
    cashifyVariant
  );
}

  if (!currentVariant.href) {
    continue;
  }

  Logger.info(
    `Processing Variant: ${currentVariant.variant}`
  );

await this.page.waitForTimeout(2000);

  const variantUrl =
    `https://www.cashify.in${currentVariant.href}`;

  console.log(
    "🌐 OPENING VARIANT:",
    variantUrl
  );

  await this.page.goto(
    variantUrl,
    {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    }
  );

  await this.page.waitForTimeout(4000);

  Logger.success(
    `Variant Opened: ${currentVariant.variant}`
  );

  const pricingEngine =
  new PricingEngine(this.page);

const maxValue =
  await pricingEngine.getMaxValue();

console.log(
  "💰 MAX VALUE:",
  maxValue
);

if (
  maxValue === null ||
  maxValue === undefined
) {

  console.log(
    "❌ Max Value Not Found"
  );

  continue;
}

  const exactValueBtn =
    this.page.locator(
      'button:has-text("Get Exact Value")'
    );

  await exactValueBtn.waitFor({
    state: "visible",
    timeout: 15000,
  });

  await exactValueBtn.click({
    force: true,
  });

  Logger.success(
    "Get Exact Value Clicked"
  );

  const questionEngine =
    new QuestionEngine(this.page);

  await questionEngine.answerAllQuestions();
  await waitIfPaused(jobId);

  const defectEngine =
    new DefectEngine(this.page);

  await defectEngine.skipDefects();
  await waitIfPaused(jobId);

  const accessoryEngine =
    new AccessoryEngine(this.page);

  await accessoryEngine.selectAccessories();
  await waitIfPaused(jobId);

  const ageEngine =
    new AgeEngine(this.page);

  const ageCount =
    await ageEngine.getAgeOptionsCount();

  const ageLabels =
    await ageEngine.getAgeLabels();

  const ageResults: any[] = [];


  // =========================
  // NO AGE PAGE
  // =========================

 if (ageCount === 0) {

  Logger.info("No Age Page Found");

  await this.page.waitForTimeout(5000);

  const exactValue =
  await pricingEngine.getExactValue();

const difference =
  maxValue - exactValue;

console.log("NO AGE PAGE");
console.log("MAX VALUE:", maxValue);
console.log("EXACT VALUE:", exactValue);
console.log("DIFFERENCE:", difference);

ageResults.push({
  age: "Above 11 months",
  exactValue,
  difference,
});

} else {

    for (
      let ageIndex = 0;
      ageIndex < ageCount;
      ageIndex++
    ) {

     if (ageIndex > 0) {

  console.log(
    "🔄 BEFORE RECALCULATE",
    ageIndex + 1
  );

 const recalculated =
  await ageEngine.clickRecalculate();

console.log(
  "🔄 AFTER RECALCULATE",
  recalculated
);

if (!recalculated) {

  throw new Error(
    `Failed to click Recalculate for age ${
      ageIndex + 1
    }`
  );
}

await questionEngine.answerAllQuestions();

  console.log(
    "🔄 QUESTIONS DONE"
  );

  await defectEngine.skipDefects();

  console.log(
    "🔄 DEFECTS DONE"
  );

  await accessoryEngine.selectAccessories();

  console.log(
    "🔄 ACCESSORIES DONE"
  );
}

      await ageEngine.selectAgeOption(
        ageIndex
      );
      await waitIfPaused(jobId);

      await this.page.waitForTimeout(
        5000
      );

      const exactValue =
        await pricingEngine.getExactValue();

      const difference =
  maxValue - exactValue;

      ageResults.push({

        age:
          ageLabels[ageIndex] ||
          `Age ${ageIndex + 1}`,

        exactValue,

        difference,
      });

      console.log(
        `AGE ${ageIndex + 1}`,
        exactValue,
        difference
      );
    }
  }
  // =========================
// UPDATE GOOGLE SHEET
// =========================
if (rowIndex && requiredVariant)
{

  const sheet = new GoogleSheetsService();

console.log("🔥 GOOGLE SHEET UPDATE START");

const below3 =
  ageResults.find(
    a => a.age.includes("Below 3")
  )?.difference ?? 0;

const mid3to6 =
  ageResults.find(
    a => a.age.includes("3 months - 6")
  )?.difference ?? 0;

const mid6to11 =
  ageResults.find(
    a => a.age.includes("6 months - 11")
  )?.difference ?? 0;

const above11 =
  ageResults.find(
    a => a.age.includes("Above 11")
  )?.difference ?? 0;


console.log(
  "AGE RESULTS:",
  JSON.stringify(ageResults, null, 2)
);
await sheet.updatePricingRow(
  rowIndex,
  maxValue,
  below3,
  mid3to6,
  mid6to11,
  above11
);

console.log("WRITING TO SHEET:", {
  rowIndex,
  maxValue,
  below3,
  mid3to6,
  mid6to11,
  above11,
});

console.log("🔥 GOOGLE SHEET UPDATE FINISHED");
console.log(`✅ Sheet Updated Row ${rowIndex}`);
}

allVariantResults.push({
  variant: currentVariant.variant,
  maxValue,
  ageResults,
});

  console.log(
    "✅ VARIANT COMPLETED:",
    currentVariant.variant
  );
    } catch (err) {
    console.log(
      `❌ VARIANT FAILED: ${currentVariant.variant}`,
      err
    );

    continue;
  }
}

if (!allVariantResults.length) {
  return {
    model,
    variants: [],
    status: "failed",
    error: "No variants processed",
  };
}

return {
  model,
  variants: allVariantResults,
  status: "success",
};
} catch (err: any) {

  console.log("❌ CASHIFY ENGINE ERROR:", err);

  return {
    model,
    found: false,
    status: "failed",
    error: err.message,
  };
}

} // ⬅️ CLOSE getPrice()

} // ⬅️ CLOSE CashifyEngine class