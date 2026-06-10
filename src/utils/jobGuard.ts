import { JobStore } from "../store/job.store";

export const waitIfPaused = async (
  jobId?: string
) => {

  if (!jobId) return;

  while (JobStore.isPaused(jobId)) {

  if (JobStore.isKilled(jobId)) {

    throw new Error(
      "Job killed by user"
    );
  }

  await new Promise(resolve =>
    setTimeout(resolve, 1000)
  );
}
};