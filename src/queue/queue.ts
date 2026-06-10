import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  maxRetriesPerRequest: null,
});

export const scrapeQueue = new Queue("scrape-queue", {
  connection,
});