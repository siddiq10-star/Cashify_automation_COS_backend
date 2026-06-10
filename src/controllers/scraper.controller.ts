import { runSheetScrapingJob } from "../jobs/scrapeFromSheet";
import { scrapeQueue } from "../queue/queue";
import { JobManager } from "../services/jobManager.service";

export const startSheetJob = async (req: any, res: any) => {
  try {
    // start job (async, non-blocking)
    runSheetScrapingJob();

    return res.json({
      jobId: "sheet-job-1",
      status: "started",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      status: "error",
      message: "Failed to start sheet job",
    });
  }
};

export const stopSheetJob = async (
  req: any,
  res: any
) => {
  try {

    await scrapeQueue.pause();

    return res.json({
      status: "stopped",
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      status: "error",
      message: "Failed to stop job",
    });
  }
};

export const getJobStatus = (
  req: any,
  res: any
) => {

  const job =
    JobManager.getActiveJob();

  return res.json({
    success: true,
    data: job,
  });
};