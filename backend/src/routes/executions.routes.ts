import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthedRequest, requireAuth } from "../middleware/auth";

export const executionsRouter = Router();
executionsRouter.use(requireAuth);

executionsRouter.get("/", async (req: AuthedRequest, res) => {
  const workflowId = req.query.workflowId as string | undefined;
  const executions = await prisma.execution.findMany({
    where: {
      workflow: { organizationId: req.auth!.organizationId },
      ...(workflowId && { workflowId }),
    },
    orderBy: { startedAt: "desc" },
    take: 100,
  });
  res.json(executions);
});

executionsRouter.get("/:id", async (req: AuthedRequest, res) => {
  const execution = await prisma.execution.findFirst({
    where: { id: req.params.id, workflow: { organizationId: req.auth!.organizationId } },
  });
  if (!execution) return res.status(404).json({ error: "Not found" });
  res.json(execution);
});
