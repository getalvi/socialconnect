import { Queue } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// BullMQ requires this specific option on the connection
export const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

export interface ExecutionJobData {
  executionId: string;
  workflowId: string;
  trigger: "manual" | "webhook" | "schedule";
  input: unknown;
}

export const executionQueue = new Queue<ExecutionJobData>("workflow-executions", {
  connection,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: 500,
    removeOnFail: 500,
  },
});
