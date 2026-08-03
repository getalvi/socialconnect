import "dotenv/config";
import { Worker } from "bullmq";
import { connection, ExecutionJobData } from "./lib/queue";
import { prisma } from "./lib/prisma";
import { runWorkflow, WorkflowDefinition } from "./engine/executor";

// Run this as a separate long-lived process (`npm run worker`), distinct from
// the API server. This is where actual node execution happens, decoupled from
// HTTP request/response so long workflows and AI agent calls don't block the API.
const worker = new Worker<ExecutionJobData>(
  "workflow-executions",
  async (job) => {
    const { executionId, workflowId, trigger, input } = job.data;

    const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

    const definition = workflow.definition as unknown as WorkflowDefinition;
    const startNode = definition.nodes.find((n) =>
      trigger === "webhook" ? n.type === "webhookTrigger" :
      trigger === "schedule" ? n.type === "scheduleTrigger" :
      n.type === "manualTrigger"
    );
    if (!startNode) throw new Error(`No matching trigger node found for trigger type "${trigger}"`);

    const result = await runWorkflow({
      organizationId: workflow.organizationId,
      workflowId: workflow.id,
      executionId,
      definition,
      startNodeId: startNode.id,
      triggerInput: input,
    });

    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: result.status,
        output: result.output ?? undefined,
        error: result.error,
        nodeLogs: result.nodeLogs as any,
        finishedAt: new Date(),
      },
    });

    return result;
  },
  { connection, concurrency: 10 }
);

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

console.log("FlowAI worker started, listening for workflow executions...");
