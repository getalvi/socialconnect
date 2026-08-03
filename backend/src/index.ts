import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.routes";
import { workflowsRouter } from "./routes/workflows.routes";
import { executionsRouter } from "./routes/executions.routes";
import { credentialsRouter } from "./routes/credentials.routes";
import { webhooksRouter } from "./routes/webhooks.routes";
import { startScheduler } from "./scheduler/cron";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/workflows", workflowsRouter);
app.use("/api/executions", executionsRouter);
app.use("/api/credentials", credentialsRouter);
app.use("/webhook", webhooksRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`FlowAI API listening on port ${PORT}`);
  // The scheduler runs in-process here for simplicity. For higher scale, move
  // it into its own process (same pattern as worker.ts) so it isn't tied to
  // API server restarts/scaling.
  startScheduler();
});
