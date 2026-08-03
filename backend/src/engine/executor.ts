import { prisma } from "../lib/prisma";
import { decryptCredential } from "../lib/crypto";
import { getNode, NodeExecutionContext } from "./nodeRegistry";

export interface WorkflowNode {
  id: string;
  type: string;
  params: Record<string, any>;
  position?: { x: number; y: number };
}

export interface WorkflowConnection {
  from: string;        // source node id
  fromOutput: string;  // output name, e.g. "main", "true", "false"
  to: string;           // target node id
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

export interface NodeLogEntry {
  nodeId: string;
  nodeType: string;
  status: "success" | "error";
  input: any;
  output?: any;
  error?: string;
  durationMs: number;
}

const MAX_STEPS = 500; // guard against infinite loops in malformed graphs

export async function runWorkflow(opts: {
  organizationId: string;
  workflowId: string;
  executionId: string;
  definition: WorkflowDefinition;
  startNodeId: string; // the trigger node that fired
  triggerInput: any;
}): Promise<{ status: "success" | "error"; output?: any; error?: string; nodeLogs: NodeLogEntry[] }> {
  const { organizationId, workflowId, executionId, definition, startNodeId, triggerInput } = opts;

  const nodesById = new Map(definition.nodes.map((n) => [n.id, n]));
  const nodeLogs: NodeLogEntry[] = [];

  const ctx: NodeExecutionContext = {
    organizationId,
    workflowId,
    executionId,
    async getCredential(credentialId: string) {
      const cred = await prisma.credential.findFirst({
        where: { id: credentialId, organizationId },
      });
      if (!cred) throw new Error(`Credential ${credentialId} not found for this organization`);
      return decryptCredential(cred.encryptedData);
    },
  };

  // Queue of (nodeId, data) pairs waiting to execute.
  const queue: Array<{ nodeId: string; data: any }> = [{ nodeId: startNodeId, data: triggerInput }];
  let lastOutput: any = null;
  let steps = 0;

  try {
    while (queue.length > 0) {
      if (++steps > MAX_STEPS) {
        throw new Error(`Execution exceeded ${MAX_STEPS} steps - possible infinite loop in workflow graph`);
      }
      const { nodeId, data } = queue.shift()!;
      const node = nodesById.get(nodeId);
      if (!node) continue;

      const def = getNode(node.type);
      const started = Date.now();
      try {
        const outputs = await def.execute(node.params || {}, data, ctx);
        nodeLogs.push({
          nodeId,
          nodeType: node.type,
          status: "success",
          input: data,
          output: outputs,
          durationMs: Date.now() - started,
        });

        // For each output the node actually produced (skip undefined, used for
        // If-node branches that didn't fire), follow matching connections.
        for (const outputName of Object.keys(outputs)) {
          if (outputs[outputName] === undefined) continue;
          lastOutput = outputs[outputName];
          const nextConnections = definition.connections.filter(
            (c) => c.from === nodeId && c.fromOutput === outputName
          );
          for (const conn of nextConnections) {
            queue.push({ nodeId: conn.to, data: outputs[outputName] });
          }
        }
      } catch (err: any) {
        nodeLogs.push({
          nodeId,
          nodeType: node.type,
          status: "error",
          input: data,
          error: err.message,
          durationMs: Date.now() - started,
        });
        throw err;
      }
    }

    return { status: "success", output: lastOutput, nodeLogs };
  } catch (err: any) {
    return { status: "error", error: err.message, nodeLogs };
  }
}
