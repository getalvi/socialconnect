import { registerNode } from "../nodeRegistry";

// Simple mustache-style {{path.to.value}} interpolation against the input object,
// so params can reference upstream node data.
function interpolate(template: string, input: any): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, path) => {
    const value = path.split(".").reduce((acc: any, key: string) => acc?.[key], input);
    return value === undefined ? "" : String(value);
  });
}

registerNode({
  type: "httpRequest",
  label: "HTTP Request",
  category: "action",
  outputs: ["main"],
  paramsSchema: {
    url: { type: "string", label: "URL", required: true },
    method: { type: "string", label: "Method", default: "GET" },
    headers: { type: "json", label: "Headers (JSON)", default: {} },
    body: { type: "json", label: "Body (JSON)", default: {} },
  },
  async execute(params, input) {
    const url = interpolate(params.url, input);
    const method = (params.method || "GET").toUpperCase();
    const headers = params.headers || {};

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: method === "GET" || method === "HEAD" ? undefined : JSON.stringify(params.body ?? {}),
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await res.json() : await res.text();

    return {
      main: {
        status: res.status,
        ok: res.ok,
        data,
      },
    };
  },
});
