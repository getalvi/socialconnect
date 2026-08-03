import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { executionQueue } from "../lib/queue";
import { syncScheduledWorkflows } from "../scheduler/cron";
import { listNodes } from "../engine/nodeRegistry";

export const workflowsRouter = Router();
workflowsRouter.use(requireAuth);

// Returns all node types the editor can render (labels, params schema, outputs).
workflowsRouter.get("/node-types", (_req, res) => {
  res.json(listNodes());
});

workflowsRouter.get("/", async (req: AuthedRequest, res) => {
  const workflows = await prisma.workflow.findMany({
    where: { organizationId: req.auth!.organizationId },
    orderBy: { updatedAt: "desc" },
  });
  res.json(workflows);
});

workflowsRouter.get("/:id", async (req: AuthedRequest, res) => {
  const workflow = await prisma.workflow.findFirst({
    where: { id: req.params.id, organizationId: req.auth!.organizationId },
  });
  if (!workflow) return res.status(404).json({ error: "Not found" });
  res.json(workflow);
});

workflowsRouter.post("/", async (req: AuthedRequest, res) => {
  const { name, definition } = req.body;
  const workflow = await prisma.workflow.create({
    data: {
      name: name || "Untitled workflow",
      organizationId: req.auth!.organizationId,
      definition: definition || { nodes: [], connections: [] },
    },
  });
  res.status(201).json(workflow);
});

workflowsRouter.put("/:id", async (req: AuthedRequest, res) => {
  const existing = await prisma.workflow.findFirst({
    where: { id: req.params.id, organizationId: req.auth!.organizationId },
  });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const { name, definition, active } = req.body;
  const workflow = await prisma.workflow.update({
    where: { id: existing.id },
    data: {
      ...(name !== undefined && { name }),
      ...(definition !== undefined && { definition }),
      ...(active !== undefined && { active }),
    },
  });

  // Registers/deregisters webhook paths whenever the definition changes.
  if (definition !== undefined || active !== undefined) {
    await syncWebhookPaths(workflow.id, workflow.definition as any, workflow.active);
    await syncScheduledWorkflows();
  }

  res.json(workflow);
});

workflowsRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const existing = await prisma.workflow.findFirst({
    where: { id: req.params.id, organizationId: req.auth!.organizationId },
  });
  if (!existing) return res.status(404).json({ error: "Not found" });
  await prisma.workflow.delete({ where: { id: existing.id } });
  res.status(204).send();
});

// Manually trigger a run from the editor's "Test workflow" button.
workflowsRouter.post("/:id/run", async (req: AuthedRequest, res) => {
  const workflow = await prisma.workflow.findFirst({
    where: { id: req.params.id, organizationId: req.auth!.organizationId },
  });
  if (!workflow) return res.status(404).json({ error: "Not found" });

  const execution = await prisma.execution.create({
    data: { workflowId: workflow.id, trigger: "manual", status: "running", input: req.body.input || {} },
  });

  await executionQueue.add("manual-run", {
    executionId: execution.id,
    workflowId: workflow.id,
    trigger: "manual",
    input: req.body.input || {},
  });

  res.status(202).json({ executionId: execution.id });
});

async function syncWebhookPaths(workflowId: string, definition: any, active: boolean) {
  await prisma.webhookPath.deleteMany({ where: { workflowId } });
  if (!active) return;

  const webhookNodes = (definition?.nodes || []).filter((n: any) => n.type === "webhookTrigger");
  for (const node of webhookNodes) {
    if (!node.params?.path) continue;
    await prisma.webhookPath.create({
      data: {
        path: node.params.path,
        workflowId,
        nodeId: node.id,
        method: node.params.method || "POST",
      },
    }).catch(() => {
      // path collision across orgs (paths are globally unique) - ignore silently,
      // the user will see no webhook fire and can pick a different path.
    });
  }
}
