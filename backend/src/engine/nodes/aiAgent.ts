import Anthropic from "@anthropic-ai/sdk";
import { registerNode } from "../nodeRegistry";

function interpolate(template: string, input: any): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, path) => {
    const value = path.split(".").reduce((acc: any, key: string) => acc?.[key], input);
    return value === undefined ? "" : typeof value === "string" ? value : JSON.stringify(value);
  });
}

interface AgentTool {
  name: string;
  description: string;
  // JSON schema for the tool's input
  input_schema: Record<string, any>;
  // When the model calls this tool, we POST {toolName, input} to this URL and
  // feed the JSON response back as the tool result. This lets a workflow expose
  // its own HTTP nodes / external services as callable tools for the agent.
  url: string;
}

registerNode({
  type: "aiAgent",
  label: "AI Agent",
  category: "ai",
  outputs: ["main"],
  paramsSchema: {
    credentialId: { type: "credential", label: "Anthropic Credential", required: true },
    model: { type: "string", label: "Model", default: "claude-sonnet-4-6" },
    systemPrompt: { type: "text", label: "System Prompt", default: "You are a helpful assistant." },
    userPrompt: { type: "text", label: "User Prompt (supports {{field}} from input)", required: true },
    tools: { type: "json", label: "Tools (optional array of {name, description, input_schema, url})", default: [] },
    maxTokens: { type: "number", label: "Max Tokens", default: 1024 },
  },
  async execute(params, input, ctx) {
    const creds = await ctx.getCredential(params.credentialId);
    const client = new Anthropic({ apiKey: creds.apiKey });

    const tools: AgentTool[] = params.tools || [];
    const userPrompt = interpolate(params.userPrompt, input);

    const messages: Anthropic.MessageParam[] = [{ role: "user", content: userPrompt }];

    const anthropicTools: Anthropic.Tool[] = tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: { type: "object", ...t.input_schema },
    }));

    let finalText = "";
    const toolCallLog: any[] = [];

    // Agent loop: keep responding to tool_use blocks until the model stops
    // calling tools or we hit a safety cap on iterations.
    for (let iteration = 0; iteration < 6; iteration++) {
      const response = await client.messages.create({
        model: params.model || "claude-sonnet-4-6",
        max_tokens: params.maxTokens || 1024,
        system: params.systemPrompt,
        messages,
        tools: anthropicTools.length ? anthropicTools : undefined,
      });

      const toolUses = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
      const textBlocks = response.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
      finalText = textBlocks.map((b) => b.text).join("\n");

      if (toolUses.length === 0 || response.stop_reason !== "tool_use") {
        break;
      }

      messages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const call of toolUses) {
        const toolDef = tools.find((t) => t.name === call.name);
        let resultPayload: any;
        try {
          if (!toolDef) throw new Error(`Tool ${call.name} not configured`);
          const res = await fetch(toolDef.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tool: call.name, input: call.input }),
          });
          resultPayload = await res.json().catch(() => res.text());
        } catch (err: any) {
          resultPayload = { error: err.message };
        }
        toolCallLog.push({ tool: call.name, input: call.input, result: resultPayload });
        toolResults.push({
          type: "tool_result",
          tool_use_id: call.id,
          content: JSON.stringify(resultPayload),
        });
      }
      messages.push({ role: "user", content: toolResults });
    }

    return { main: { text: finalText, toolCalls: toolCallLog } };
  },
});
