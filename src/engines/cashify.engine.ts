import { Page } from "playwright";
import { Logger } from "../utils/logger";
import { VariantEngine } from "./variant.engine";
import { PricingEngine } from "./pricing.engine";
import { waitIfPaused } from "../utils/jobGuard";
import { AgeEngine } from "./age.engine";
import { runInspectionFlow } from "../workflows/inspection.workflow";
import { updateSheetPricing } from "../workflows/sheetUpdate.workflow";

export class CashifyEngine {
  constructor(private page: Page) {}

  async getPrice(
    model: string,
    requiredVariant?: string,
    rowIndex?: number,
    jobId?: string,
  ) {
    try {
      Logger.info(`Searching ${model}`);

      // =========================
      // OPEN CASHIFY
      // =========================

      await this.page.goto("https://www.cashify.in", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      // =========================
      // WAIT PAGE LOAD
      // =========================

      await this.page.waitForTimeout(6000);

      // =========================
      // CLICK SEARCH WRAPPER
      // =========================

      const searchWrapper = this.page
        .locator("div.px-2.flex.flex-row.justify-center.items-center")
        .first();

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
        'input[placeholder*="Search"]:not([disabled])',
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

      await this.page.keyboard.type(model, {
        delay: 100,
      });

      Logger.success("Typing Complete");

      // =========================
      // WAIT DROPDOWN
      // =========================

      await this.page.waitForTimeout(3000);

      // =========================
      // FIND SUGGESTION TEXT
      // =========================

      // =========================
      // FIND BEST MATCHING SUGGESTION
      // =========================

      const suggestionLocator = this.page.locator(
        "span.subtitle8.text-primary-text-dark.line-clamp-3",
      );

      await suggestionLocator.first().waitFor({
        state: "visible",
        timeout: 15000,
      });

      const count = await suggestionLocator.count();

      console.log("🔍 TOTAL SUGGESTIONS:", count);

      let bestIndex = -1;

      const normalize = (text: string) => text.toLowerCase().trim();

      const normalizeModel = (text: string) =>
        text
          .toLowerCase()
          .replace(/\([^)]*\)/g, "")
          .trim();

      for (let i = 0; i < count; i++) {
        const text =
          (await suggestionLocator.nth(i).textContent())?.trim() || "";

        console.log(`Suggestion ${i}:`, text);

        const suggestionName = normalizeModel(text);

        const targetName = normalizeModel(model);

        if (suggestionName === targetName) {
          bestIndex = i;
          break;
        }
      }

      if (bestIndex === -1) {
        throw new Error(`Exact suggestion not found for: ${model}`);
      }

      console.log("✅ MATCHED SUGGESTION:", bestIndex);

      const suggestionText = suggestionLocator.nth(bestIndex);

      Logger.success("Suggestion Text Found");

      // =========================
      // CLICK ACTUAL ROW
      // =========================

      const clickableRow = suggestionText.locator(
        "xpath=ancestor::span[contains(@class,'cursor-pointer')][1]",
      );

      await clickableRow.waitFor({
        state: "visible",
        timeout: 10000,
      });

      Logger.success("Clickable Row Found");

      await clickableRow.evaluate((el: any) => {
        el.click();
      });

      Logger.success("Suggestion Clicked");

      // =========================
      // WAIT PRODUCT PAGE
      // =========================

      await this.page.waitForTimeout(5000);

      Logger.success("Product Page Opened");

      console.log("CURRENT URL:", this.page.url());
      // =========================
      // GET VARIANTS
      // =========================

      const variantEngine = new VariantEngine(this.page);

      let variants = await variantEngine.getVariants();

      if (variants.length > 0) {
        console.log("✅ VARIANT PAGE DETECTED");
      } else {
        console.log("✅ NO VARIANT PAGE DETECTED");

        variants.push({
          variant: requiredVariant,
          href: null,
        });
      }

      await waitIfPaused(jobId);

      // If no variant page exists,
      // treat current page as single variant model

      if (!variants.length) {
        console.log("✅ NO VARIANT PAGE FOUND");

        variants = [
          {
            variant: requiredVariant || "Default",
            href: null,
          },
        ];
      }

      console.log("📦 FINAL VARIANTS:", variants);

      const allVariantResults: any[] = [];

      for (const currentVariant of variants) {
        try {
          if (requiredVariant) {
            const normalizeVariant = (value: string) =>
              value.toLowerCase().replace(/gb/g, "").replace(/\s+/g, "").trim();

            const sheetVariant = normalizeVariant(requiredVariant);

            const cashifyVariant = normalizeVariant(currentVariant.variant);

            // Android variants
            if (
              sheetVariant === cashifyVariant ||
              sheetVariant.includes(cashifyVariant) ||
              cashifyVariant.includes(sheetVariant)
            ) {
              console.log("✅ MATCHED VARIANT:", currentVariant.variant);
            } else {
              continue;
            }
          }

          Logger.info(`Processing Variant: ${currentVariant.variant}`);

          await this.page.waitForTimeout(2000);

          if (currentVariant.href) {
            const variantUrl = `https://www.cashify.in${currentVariant.href}`;

            console.log("🌐 OPENING VARIANT:", variantUrl);

            await this.page.goto(variantUrl, {
              waitUntil: "domcontentloaded",
              timeout: 60000,
            });

            await this.page.waitForTimeout(4000);

            console.log("✅ VARIANT PAGE OPENED");
          } else {
            console.log("✅ USING CURRENT PAGE (Single Variant)");
          }

          Logger.success(`Variant Opened: ${currentVariant.variant}`);

          const pricingEngine = new PricingEngine(this.page);

          const maxValue = await pricingEngine.getMaxValue();

          console.log("💰 MAX VALUE:", maxValue);

          if (maxValue === null || maxValue === undefined) {
            console.log("❌ Max Value Not Found");

            continue;
          }

          const exactValueBtn = this.page.locator(
            'button:has-text("Get Exact Value")',
          );

          await exactValueBtn.waitFor({
            state: "visible",
            timeout: 15000,
          });

          await exactValueBtn.click({
            force: true,
          });

          Logger.success("Get Exact Value Clicked");

          await runInspectionFlow(this.page, jobId);

          const ageEngine = new AgeEngine(this.page);

          const ageCount = await ageEngine.getAgeOptionsCount();

          const ageLabels = await ageEngine.getAgeLabels();

          const ageResults: any[] = [];

          // =========================
          // NO AGE PAGE
          // =========================

          if (ageCount === 0) {
            Logger.info("No Age Page Found");

            await this.page.waitForTimeout(5000);

            console.log(
  "CURRENT URL:",
  this.page.url()
);

console.log(
  "PAGE TITLE:",
  await this.page.title()
);

            const exactValue = await pricingEngine.getExactValue();

            const difference = maxValue - exactValue;

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
            for (let ageIndex = 0; ageIndex < ageCount; ageIndex++) {
              if (ageIndex > 0) {
                console.log("🔄 BEFORE RECALCULATE", ageIndex + 1);

                const recalculated = await ageEngine.clickRecalculate();

                console.log("🔄 AFTER RECALCULATE", recalculated);

                if (!recalculated) {
                  throw new Error(
                    `Failed to click Recalculate for age ${ageIndex + 1}`,
                  );
                }

                await runInspectionFlow(this.page, jobId);

                console.log("🔄 INSPECTION FLOW DONE");
              }

              await ageEngine.selectAgeOption(ageIndex);
              await waitIfPaused(jobId);

              await this.page.waitForTimeout(5000);

              const exactValue = await pricingEngine.getExactValue();

              const difference = maxValue - exactValue;

              ageResults.push({
                age: ageLabels[ageIndex] || `Age ${ageIndex + 1}`,

                exactValue,

                difference,
              });

              console.log(`AGE ${ageIndex + 1}`, exactValue, difference);
            }
          }
          // =========================
          // UPDATE GOOGLE SHEET
          // =========================

          if (rowIndex && requiredVariant) {
            await updateSheetPricing(rowIndex, maxValue, ageResults);
          }

          allVariantResults.push({
            variant: currentVariant.variant,
            maxValue,
            ageResults,
          });

          console.log("✅ VARIANT COMPLETED:", currentVariant.variant);
        } catch (err) {
          console.log(`❌ VARIANT FAILED: ${currentVariant.variant}`, err);

          continue;
        }
      } // CLOSE for loop

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
  } // CLOSE getPrice()
} // CLOSE CashifyEngine class
