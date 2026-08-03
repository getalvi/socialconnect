import { registerNode } from "../nodeRegistry";

registerNode({
  type: "manualTrigger",
  label: "Manual Trigger",
  category: "trigger",
  outputs: ["main"],
  paramsSchema: {},
  async execute(_params, input) {
    return { main: input ?? {} };
  },
});
