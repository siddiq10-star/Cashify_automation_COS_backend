import { GoogleSheetsService } from "../services/googleSheets.service";
import { scrapeQueue } from "../queue/queue";
import { JobStore } from "../store/job.store";
import { Logger } from "../utils/logger";
import { JobManager } from "../services/jobManager.service";

export const startSheetJob = async (
  selectedBrand = "ALL",
  startModel?: string
) => {
  Logger.info("🔥 startSheetJob CALLED");

  const sheet = new GoogleSheetsService();

  const rows = await sheet.readModels();

  console.log("FIRST ROW:");
console.log(JSON.stringify(rows[0], null, 2));

  Logger.info(`Loaded ${rows.length} rows from sheet`);

  const validRows = rows.filter((r) => {
    if (!r) return false;

    if (typeof r.model !== "string") return false;

    return r.model.trim().length > 0;
  });

  let pendingModels =
  selectedBrand &&
  selectedBrand !== "ALL"
    ? validRows.filter(
        row =>
          row.brand
            ?.trim()
            .toLowerCase()
            .includes(
              selectedBrand
                .trim()
                .toLowerCase()
            )
      )
    : validRows;

// =====================
// START FROM MODEL
// =====================

if (
  startModel &&
  startModel.trim()
) {

  const startIndex =
    pendingModels.findIndex(
      row =>
        row.model
          .trim()
          .toLowerCase() ===
        startModel
          .trim()
          .toLowerCase()
    );

  if (startIndex >= 0) {

    pendingModels =
      pendingModels.slice(
        startIndex
      );

    Logger.info(
      `🚀 Starting from model: ${startModel}`
    );

  } else {

    Logger.info(
      `❌ Start model not found: ${startModel}`
    );

  }
}

  Logger.info(`Valid rows: ${pendingModels.length}`);

  if (pendingModels.length > 0) {
    Logger.info(
      `First model => ${pendingModels[0].brand} | ${pendingModels[0].model} | ${pendingModels[0].variant}`
    );
  }

  const jobId = Date.now().toString();

  JobStore.create(jobId, pendingModels.length);
  JobManager.setActiveJob(jobId);

  for (const row of pendingModels) {
    await scrapeQueue.add(
  "scrape",
  {
    model: `${row.brand} ${row.model}`.trim(),
    variant: row.variant,
    brand: row.brand,
    rowIndex: row.rowIndex,
    jobId,
  },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      }
    );
  }

  Logger.info(
    `Queued ${pendingModels.length} models for scraping. JobId: ${jobId}`
  );

  return jobId;
};