import { registerNode } from "../nodeRegistry";

// This node is a "marker": the actual HTTP listener is registered in
// routes/webhooks.routes.ts (via the WebhookPath table) when a workflow is
// activated. When the webhook fires, the incoming request body/query/headers
// become this node's output, and execution proceeds from here.
registerNode({
  type: "webhookTrigger",
  label: "Webhook",
  category: "trigger",
  outputs: ["main"],
  paramsSchema: {
    path: { type: "string", label: "Path (unique, e.g. my-workflow)", required: true },
    method: { type: "string", label: "HTTP Method", default: "POST" },
  },
  async execute(_params, input) {
    // input is the incoming request payload injected by the webhook route
    return { main: input ?? {} };
  },
});
