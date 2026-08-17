const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getToken(): string | null {
  return localStorage.getItem("flowai_token");
}

export function setToken(token: string) {
  localStorage.setItem("flowai_token", token);
}

export function clearToken() {
  localStorage.removeItem("flowai_token");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// Parses a response body as JSON only if the server actually says it's JSON.
// Before this, `res.json()` was called unconditionally - if the backend (or
// something in front of it, like a platform's own error page) ever returned
// HTML or plain text, the browser's JSON.parse would throw a raw
// "Unexpected token '<', "<!doctype "... is not valid JSON" (or similar)
// with no indication of what actually went wrong. This surfaces a clear,
// readable error instead, and never crashes on a non-JSON body.
async function parseResponseBody(res: Response): Promise<any> {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!text) return null;
  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected JSON from ${res.url} but got "${contentType || "unknown content-type"}". ` +
      `This usually means the backend URL is wrong, the backend is down, or a proxy/host returned ` +
      `an error page instead of the API response. Raw response (truncated): ${text.slice(0, 200)}`
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Backend returned invalid JSON from ${res.url}: ${text.slice(0, 200)}`);
  }
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (err: any) {
    // fetch() itself throws (network error, CORS block, DNS failure, backend
    // completely unreachable) before any response exists at all - distinct
    // from an HTTP error status, and worth a clearer message than the
    // browser's generic "Failed to fetch".
    throw new Error(`Could not reach ${API_URL}${path} - check VITE_API_URL and that the backend is running. (${err.message})`);
  }
  if (!res.ok) {
    const body = await parseResponseBody(res).catch(() => ({}));
    throw new Error(body.error ? JSON.stringify(body.error) : `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return parseResponseBody(res);
}

export const api = {
  register: (data: { email: string; password: string; name?: string; organizationName: string }) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),

  listWorkflows: () => request("/api/workflows"),
  getWorkflow: (id: string) => request(`/api/workflows/${id}`),
  createWorkflow: (data: { name: string; definition: any }) =>
    request("/api/workflows", { method: "POST", body: JSON.stringify(data) }),
  updateWorkflow: (id: string, data: any) =>
    request(`/api/workflows/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteWorkflow: (id: string) => request(`/api/workflows/${id}`, { method: "DELETE" }),
  runWorkflow: (id: string, input: any = {}) =>
    request(`/api/workflows/${id}/run`, { method: "POST", body: JSON.stringify({ input }) }),
  getNodeTypes: () => request("/api/workflows/node-types"),

  listExecutions: (workflowId?: string) =>
    request(`/api/executions${workflowId ? `?workflowId=${workflowId}` : ""}`),
  getExecution: (id: string) => request(`/api/executions/${id}`),

  listCredentials: () => request("/api/credentials"),
  createCredential: (data: { name: string; type: string; data: Record<string, any> }) =>
    request("/api/credentials", { method: "POST", body: JSON.stringify(data) }),
  deleteCredential: (id: string) => request(`/api/credentials/${id}`, { method: "DELETE" }),
};
