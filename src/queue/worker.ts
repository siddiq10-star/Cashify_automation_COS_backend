import { Worker } from "bullmq";
import IORedis from "ioredis";

import { ScraperWorker } from "../workers/scraper.worker";
import { JobStore } from "../store/job.store";

const connection = new IORedis({
  maxRetriesPerRequest: null,
});

export const worker = new Worker(
  "scrape-queue",

  async (job) => {

    const {
  model,
  variant,
  rowIndex,
  jobId,
} = job.data;

// 🔥 WAIT IF JOB IS PAUSED
while (JobStore.isPaused(jobId)) {

  console.log(
    `⏸ Job ${jobId} paused. Waiting...`
  );

  await new Promise((resolve) =>
    setTimeout(resolve, 2000)
  );
}
JobStore.updateCurrent(
  jobId,
  model,
  variant,
  rowIndex
);

if (JobStore.isKilled(jobId))
{
  return;
}

console.log("🚀 Processing:", model);

try {

  const result = await ScraperWorker.run(
    model,
    variant,
    rowIndex,
    jobId
  );

      console.log("✅ RESULT:", result);

      JobStore.addResult(jobId, result);

      return result;

    } catch (err: any) {

      console.log("❌ WORKER ERROR:", err);

      JobStore.addResult(jobId, {
        model,
        status: "failed",
        price: null,
        error: err.message,
      });

      throw err;
    }
  },

  {
    connection,
    concurrency: 1,
  }
);