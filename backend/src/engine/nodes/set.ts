import { registerNode } from "../nodeRegistry";

function interpolateDeep(value: any, input: any): any {
  if (typeof value === "string") {
    return value.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path) => {
      const v = path.split(".").reduce((acc: any, key: string) => acc?.[key], input);
      return v === undefined ? "" : String(v);
    });
  }
  if (Array.isArray(value)) return value.map((v) => interpolateDeep(v, input));
  if (value && typeof value === "object") {
    const out: Record<string, any> = {};
    for (const k of Object.keys(value)) out[k] = interpolateDeep(value[k], input);
    return out;
  }
  return value;
}

registerNode({
  type: "set",
  label: "Set / Transform",
  category: "logic",
  outputs: ["main"],
  paramsSchema: {
    fields: { type: "json", label: "Fields to set (JSON, supports {{path}} interpolation)", default: {} },
    keepOnlySet: { type: "boolean", label: "Keep only these fields (drop rest of input)", default: false },
  },
  async execute(params, input) {
    const resolved = interpolateDeep(params.fields || {}, input);
    const main = params.keepOnlySet ? resolved : { ...input, ...resolved };
    return { main };
  },
});
