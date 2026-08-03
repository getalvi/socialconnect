import { registerNode } from "../nodeRegistry";

function interpolate(template: string, input: any): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path) => {
    const v = path.split(".").reduce((acc: any, key: string) => acc?.[key], input);
    return v === undefined ? "" : String(v);
  });
}

registerNode({
  type: "slack",
  label: "Slack",
  category: "action",
  outputs: ["main"],
  paramsSchema: {
    credentialId: { type: "credential", label: "Slack Credential (bot token)", required: true },
    channel: { type: "string", label: "Channel (e.g. #general)", required: true },
    text: { type: "text", label: "Message (supports {{path}} interpolation)", required: true },
  },
  async execute(params, input, ctx) {
    const creds = await ctx.getCredential(params.credentialId);
    const text = interpolate(params.text, input);

    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ channel: params.channel, text }),
    });
    const data: any = await res.json();
    if (!data.ok) throw new Error(`Slack API error: ${data.error}`);
    return { main: data };
  },
});
