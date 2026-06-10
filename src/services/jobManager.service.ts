import { scrapeQueue } from "../queue/queue";
import { JobStore } from "../store/job.store";

export class JobManager {
  static activeJobId: string | null = null;

  static setActiveJob(jobId: string) {
    this.activeJobId = jobId;
  }

  static getActiveJob() {
    if (!this.activeJobId) return null;

    return JobStore.get(this.activeJobId);
  }

  static async pause() {
    if (!this.activeJobId) return;

    JobStore.pause(this.activeJobId);
  }

  static async resume() {
    if (!this.activeJobId) return;

    JobStore.resume(this.activeJobId);
  }

  static async stop() {
    if (!this.activeJobId) return;

    JobStore.stop(this.activeJobId);

    await scrapeQueue.pause();

    await scrapeQueue.drain();
  }
}