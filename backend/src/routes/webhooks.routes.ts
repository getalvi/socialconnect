import { Router } from "express";
import { prisma } from "../lib/prisma";
import { executionQueue } from "../lib/queue";

export const webhooksRouter = Router();

// Public endpoint, e.g. POST https://your-backend.example.com/webhook/my-workflow
// No auth here by design - webhooks are triggered by external services, not
// logged-in users. Access control is the uniqueness/obscurity of the path,
// same model n8n uses; add a shared-secret header check per-workflow if needed.
webhooksRouter.all("/:path", async (req, res) => {
  const webhookPath = await prisma.webhookPath.findUnique({
    where: { path: req.params.path },
    include: { workflow: true },
  });

  if (!webhookPath || !webhookPath.workflow.active) {
    return res.status(404).json({ error: "No active workflow listening on this path" });
  }
  if (webhookPath.method !== "ALL" && req.method !== webhookPath.method) {
    return res.status(405).json({ error: `Expected ${webhookPath.method}` });
  }

  const execution = await prisma.execution.create({
    data: {
      workflowId: webhookPath.workflowId,
      trigger: "webhook",
      status: "running",
      input: { body: req.body, query: req.query, headers: req.headers },
    },
  });

  await executionQueue.add("webhook-run", {
    executionId: execution.id,
    workflowId: webhookPath.workflowId,
    trigger: "webhook",
    input: { body: req.body, query: req.query, headers: req.headers },
  });

  // Respond immediately; the workflow runs asynchronously in the worker process.
  // Check execution status via GET /api/executions/:id from the frontend.
  res.status(202).json({ received: true, executionId: execution.id });
});
