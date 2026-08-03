import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { executionQueue } from "../lib/queue";
import { WorkflowDefinition } from "../engine/executor";

const activeTasks = new Map<string, cron.ScheduledTask>();

async function enqueueScheduledRun(workflowId: string) {
  const execution = await prisma.execution.create({
    data: { workflowId, trigger: "schedule", status: "running" },
  });
  await executionQueue.add("scheduled-run", {
    executionId: execution.id,
    workflowId,
    trigger: "schedule",
    input: { triggeredAt: new Date().toISOString() },
  });
}

// Call this on startup, and again whenever a workflow is activated/deactivated/edited.
export async function syncScheduledWorkflows() {
  const workflows = await prisma.workflow.findMany({ where: { active: true } });

  // Tear down tasks for workflows no longer active.
  for (const [workflowId, task] of activeTasks) {
    if (!workflows.find((w: { id: string }) => w.id === workflowId)) {
      task.stop();
      activeTasks.delete(workflowId);
    }
  }

  for (const workflow of workflows) {
    const definition = workflow.definition as unknown as WorkflowDefinition;
    const scheduleNode = definition.nodes.find((n) => n.type === "scheduleTrigger");
    if (!scheduleNode) continue;

    const expr = scheduleNode.params?.cronExpression;
    if (!expr || !cron.validate(expr)) continue;

    // Re-create the task if it doesn't exist yet (cheap check; avoids double-registering).
    if (!activeTasks.has(workflow.id)) {
      const task = cron.schedule(expr, () => enqueueScheduledRun(workflow.id));
      activeTasks.set(workflow.id, task);
    }
  }

  console.log(`Scheduler: ${activeTasks.size} active scheduled workflow(s).`);
}

// Re-sync periodically in case workflows were activated/edited by the API
// process (which runs separately from wherever this scheduler lives).
export function startScheduler() {
  syncScheduledWorkflows();
  setInterval(syncScheduledWorkflows, 60_000);
}
