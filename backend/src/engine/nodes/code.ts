import vm from "node:vm";
import { registerNode } from "../nodeRegistry";

// SECURITY NOTE: Node's built-in `vm` module is NOT a true security sandbox
// (it does not protect against all forms of escape). It's fine for trusted
// users running their own code in their own org, which is this platform's
// model. If you open this up to untrusted third parties, run this node in an
// isolated worker process/container instead (e.g. gVisor, Firecracker, or a
// separate low-privilege microservice) rather than in-process.
registerNode({
  type: "code",
  label: "Code (JavaScript)",
  category: "logic",
  outputs: ["main"],
  paramsSchema: {
    code: {
      type: "text",
      label: "JavaScript (has `input` in scope, must return an object)",
      default: "return { ...input, processed: true };",
    },
  },
  async execute(params, input) {
    const script = new vm.Script(`(function(input) { ${params.code} })(INPUT)`);
    const sandbox: Record<string, any> = { INPUT: input, console };
    vm.createContext(sandbox);
    const result = script.runInContext(sandbox, { timeout: 5000 });
    return { main: result ?? {} };
  },
});
