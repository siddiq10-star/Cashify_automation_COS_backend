export type Result = {
  model: string;
  status: string;
  price: number | null;
  error?: string;
};

export type JobData = {
  id: string;
  total: number;
  completed: number;
  running: boolean;
  paused?: boolean;
  killed?: boolean;

  results: Result[];

  currentIndex?: number;
  currentModel?: string;
  currentVariant?: string;
  failed?: number;
};

export class JobStore {
  static jobs: Record<string, JobData> = {};

  static create(jobId: string, total: number) {
    this.jobs[jobId] = {
      id: jobId,
      total,
      completed: 0,
      running: true,
      paused: false,
      results: [],
      failed: 0,
    };
  }

  static stop(jobId: string) {
  const job = this.jobs[jobId];
  if (!job) return;

  job.running = false;
}

static pause(jobId: string) {
  const job = this.jobs[jobId];
  if (!job) return;

  job.paused = true;
  job.running = false;
}

static resume(jobId: string) {
  const job = this.jobs[jobId];
  if (!job) return;

  job.paused = false;
  job.running = true;
}

static isPaused(jobId: string) {
  const job = this.jobs[jobId];

  return job?.paused ?? false;
}

static updateIndex(jobId: string, index: number) {
  const job = this.jobs[jobId];
  if (!job) return;

  job.currentIndex = index;
}

static updateCurrent(
  jobId: string,
  model: string,
  variant?: string,
  rowIndex?: number
) {
  const job = this.jobs[jobId];

  if (!job) return;

  job.currentModel = model;
  job.currentVariant = variant;
  job.currentIndex = rowIndex;
}

  static addResult(
  jobId: string,
  result: Result
) {
  const job = this.jobs[jobId];

  if (!job) return;

  job.results.push(result);

  job.completed++;

  if (
    result.status === "failed"
  ) {
    job.failed =
      (job.failed || 0) + 1;
  }

  if (
    job.completed >= job.total
  ) {
    job.running = false;
  }
}

  static get(jobId: string) {
    return this.jobs[jobId];
  }
  
  static kill(jobId: string) {
    
    const job = this.jobs[jobId];
    
    if (!job) return;
    
    job.killed = true;
    job.running = false;
    job.paused = false;
  }
  
  static isKilled(jobId: string) {
    
    const job = this.jobs[jobId];
    
    return job?.killed ?? false;
  }
}