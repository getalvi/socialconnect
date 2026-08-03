import { registerNode } from "../nodeRegistry";

function getPath(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function compare(a: any, op: string, b: any): boolean {
  switch (op) {
    case "equals": return a == b;
    case "notEquals": return a != b;
    case "contains": return String(a ?? "").includes(String(b ?? ""));
    case "greaterThan": return Number(a) > Number(b);
    case "lessThan": return Number(a) < Number(b);
    case "isTrue": return Boolean(a) === true;
    case "isFalse": return Boolean(a) === false;
    default: return false;
  }
}

registerNode({
  type: "if",
  label: "If",
  category: "logic",
  outputs: ["true", "false"],
  paramsSchema: {
    field: { type: "string", label: "Field path (e.g. main.status)", required: true },
    operator: {
      type: "select",
      label: "Operator",
      default: "equals", // equals | notEquals | contains | greaterThan | lessThan | isTrue | isFalse
    },
    value: { type: "string", label: "Comparison value" },
  },
  async execute(params, input) {
    const fieldValue = getPath(input, params.field);
    const passed = compare(fieldValue, params.operator, params.value);
    return passed ? { true: input, false: undefined } : { true: undefined, false: input };
  },
});
