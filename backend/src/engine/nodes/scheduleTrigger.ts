import { registerNode } from "../nodeRegistry";

// Marker node: cron.ts scans active workflows for nodes of this type and
// registers a node-cron job per workflow using the `cronExpression` param.
registerNode({
  type: "scheduleTrigger",
  label: "Schedule",
  category: "trigger",
  outputs: ["main"],
  paramsSchema: {
    cronExpression: { type: "string", label: "Cron expression (e.g. */15 * * * *)", required: true },
  },
  async execute(_params) {
    return { main: { triggeredAt: new Date().toISOString() } };
  },
});
