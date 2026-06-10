import express from "express";
import cors from "cors";
import { startSheetJob } from "./jobs/startSheetJob";

import { scrapeQueue } from "./queue/queue";

import "./queue/worker";
import { JobStore } from "./store/job.store";

const app = express();
(async () => {
  try {
    console.log("🧹 Clearing old queue jobs...");

    await scrapeQueue.obliterate({ force: true });

    console.log("✅ Queue cleared");
  } catch (error) {
    console.error("❌ Queue clear failed:", error);
  }
})();

app.use(cors());
app.use(express.json());

// =====================================
// START SCRAPING FROM GOOGLE SHEET
// =====================================
app.post("/api/start", async (req, res) => {
  console.log("🔥 START BUTTON CLICKED");

  try {

    const {
      brand,
      startModel
    } = req.body;

    const jobId =
      await startSheetJob(
        brand,
        startModel
      );

    res.json({
      success: true,
      jobId,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
    });

  }
});

app.post("/api/stop/:jobId", (req, res) => {

  JobStore.pause(req.params.jobId);

  res.json({
    success: true,
  });
});

app.post("/api/kill/:jobId", async (req, res) => {

  const jobId =
    req.params.jobId;

  JobStore.kill(jobId);

  await scrapeQueue.pause();

  await scrapeQueue.drain();

  res.json({
    success: true,
  });
});

app.post("/api/resume/:jobId", (req, res) => {

  JobStore.resume(req.params.jobId);

  res.json({
    success: true,
  });
});

// =====================================
// JOB STATUS
// =====================================
app.get("/api/status/:jobId", (req, res) => {
  const job = JobStore.get(req.params.jobId);

  res.json(job);
});

// =====================================
// SERVER
// =====================================
app.listen(4000, () => {
  console.log("🚀 Backend running on port 4000");
});