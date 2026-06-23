// import { Page } from "playwright";
// import { Logger } from "../utils/logger";

// export class VariantEngine {
//   constructor(private page: Page) {}

//   async getVariants() {
//     Logger.info("Detecting variants");

//     try {
//       await this.page.waitForFunction(
//         () => {
//           const oldLayout =
//             document.querySelectorAll(
//               'li[id^="variant-"]'
//             ).length > 0;

//           const newLayout =
//             document.querySelectorAll(
//               'a[href*="/used-"] span'
//             ).length > 0;

//           return oldLayout || newLayout;
//         },
//         {
//           timeout: 5000,
//         }
//       );
//     } catch {
//       console.log(
//         "ℹ️ No Variant Layout Found"
//       );

//       return [];
//     }

//     let variants: {
//       variant: string;
//       href: string | null;
//     }[] = [];

//     // =========================
//     // OLD CASHIFY LAYOUT
//     // =========================

//     const oldCount =
//       await this.page
//         .locator('li[id^="variant-"]')
//         .count();

//     if (oldCount > 0) {
//       Logger.info(
//         `Using OLD variant layout (${oldCount} variants)`
//       );

//       variants =
//         await this.page
//           .locator('li[id^="variant-"]')
//           .evaluateAll((elements) => {
//             return elements.map((el: any) => ({
//               variant:
//                 el.querySelector("span")
//                   ?.innerText
//                   ?.trim() || "",

//               href:
//                 el.querySelector("a")
//                   ?.getAttribute("href") || null,
//             }));
//           });
//     }

//     // =========================
//     // NEW CASHIFY LAYOUT
//     // =========================

//     else {
//       Logger.info(
//         "Using NEW variant layout"
//       );

//       variants =
//         await this.page
//           .locator('a[href*="/used-"]')
//           .evaluateAll((elements) => {
            
//             return elements
//               .map((el: any) => ({
//                 variant:
//                   el.querySelector("span")
//                     ?.innerText
//                     ?.trim() || "",

//                 href:
//                   el.getAttribute("href"),
//               }))
//               .filter(
//                 (v: any) =>
//                   v.variant &&
//                   v.variant.length > 0
//               );
//           });
//     }

//     // =========================
//     // REMOVE DUPLICATES
//     // =========================

//     const uniqueVariants =
//       variants.filter(
//         (v, index, self) =>
//           index ===
//           self.findIndex(
//             x =>
//               x.variant === v.variant
//           )
//       );

//     console.log(
//       "📦 VARIANTS FOUND:",
//       uniqueVariants
//     );

//     Logger.success(
//       `${uniqueVariants.length} variants found`
//     );

//     return uniqueVariants;
//   }
// }

import { Page } from "playwright";
import { Logger } from "../utils/logger";

export class VariantEngine {
  constructor(private page: Page) {}

  async getVariants() {
    Logger.info("Detecting variants");

    const variantCount =
      await this.page.locator('li[id^="variant-"]').count();

    if (variantCount === 0) {
      Logger.info(
        "No variant section found (single variant model)"
      );

      return [];
    }

    Logger.info(
      `Found ${variantCount} variants`
    );

    const variants =
      await this.page
        .locator('li[id^="variant-"]')
        .evaluateAll((elements) => {
          return elements.map((el: any) => ({
            variant:
              el.querySelector("span")
                ?.innerText
                ?.trim() || "",

            href:
              el.querySelector("a")
                ?.getAttribute("href") || "",
          }));
        });

    console.log(
      "📦 VARIANTS FOUND:",
      variants
    );

    return variants;
  }
}