// Every node in the system implements this interface. To add a new integration,
// create a file in ./nodes and register it at the bottom of this file.

export interface NodeExecutionContext {
  organizationId: string;
  workflowId: string;
  executionId: string;
  // Resolves a stored credential by id, decrypting it just-in-time.
  getCredential: (credentialId: string) => Promise<Record<string, any>>;
}

export interface NodeDefinition {
  type: string;           // unique key, e.g. "httpRequest"
  label: string;          // display name
  category: "trigger" | "action" | "logic" | "ai";
  // outputs a node can produce, e.g. ["main"] or ["true", "false"] for an If node
  outputs: string[];
  // params schema is intentionally loose (validated per-node); the editor renders
  // a generic form from this description.
  paramsSchema: Record<string, { type: string; label: string; required?: boolean; default?: any }>;
  execute: (
    params: Record<string, any>,
    input: any,
    ctx: NodeExecutionContext
  ) => Promise<Record<string, any>>; // keyed by output name -> data
}

const registry = new Map<string, NodeDefinition>();

export function registerNode(def: NodeDefinition) {
  registry.set(def.type, def);
}

export function getNode(type: string): NodeDefinition {
  const def = registry.get(type);
  if (!def) throw new Error(`Unknown node type: ${type}`);
  return def;
}

export function listNodes(): NodeDefinition[] {
  return Array.from(registry.values());
}

// --- register built-in nodes ---
import "./nodes/manualTrigger";
import "./nodes/webhookTrigger";
import "./nodes/scheduleTrigger";
import "./nodes/httpRequest";
import "./nodes/aiAgent";
import "./nodes/code";
import "./nodes/ifNode";
import "./nodes/set";
import "./nodes/slack";
import "./nodes/email";
