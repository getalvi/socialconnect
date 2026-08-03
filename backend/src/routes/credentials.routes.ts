import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { encryptCredential } from "../lib/crypto";

export const credentialsRouter = Router();
credentialsRouter.use(requireAuth);

// Never include encryptedData in list/detail responses - the whole point of
// this table is that secrets aren't retrievable via the API once stored.
credentialsRouter.get("/", async (req: AuthedRequest, res) => {
  const creds = await prisma.credential.findMany({
    where: { organizationId: req.auth!.organizationId },
    select: { id: true, name: true, type: true, createdAt: true },
  });
  res.json(creds);
});

credentialsRouter.post("/", async (req: AuthedRequest, res) => {
  const { name, type, data } = req.body;
  if (!name || !type || !data) return res.status(400).json({ error: "name, type, and data are required" });

  const cred = await prisma.credential.create({
    data: {
      name,
      type,
      organizationId: req.auth!.organizationId,
      encryptedData: encryptCredential(data),
    },
    select: { id: true, name: true, type: true, createdAt: true },
  });
  res.status(201).json(cred);
});

credentialsRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const existing = await prisma.credential.findFirst({
    where: { id: req.params.id, organizationId: req.auth!.organizationId },
  });
  if (!existing) return res.status(404).json({ error: "Not found" });
  await prisma.credential.delete({ where: { id: existing.id } });
  res.status(204).send();
});
