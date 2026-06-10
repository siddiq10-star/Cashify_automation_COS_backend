import express from "express";

import {
  startSheetJob,
  stopSheetJob,
  getJobStatus,
} from "../controllers/scraper.controller";

const router = express.Router();

// Start
router.post(
  "/start-sheet-job",
  startSheetJob
);

// Stop
router.post(
  "/stop-sheet-job",
  stopSheetJob
);

// Status
router.get(
  "/status",
  getJobStatus
);

export default router;