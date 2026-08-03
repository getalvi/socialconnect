import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword, signToken } from "../lib/auth";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  organizationName: z.string().min(1),
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password, name, organizationName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await hashPassword(password);

  // New signups get their own organization (tenant), created transactionally.
  const org = await prisma.organization.create({
    data: {
      name: organizationName,
      users: { create: { email, passwordHash, name, role: "owner" } },
    },
    include: { users: true },
  });

  const user = org.users[0];
  const token = signToken({ userId: user.id, organizationId: org.id, role: user.role });
  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name }, organization: { id: org.id, name: org.name } });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email }, include: { organization: true } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ userId: user.id, organizationId: user.organizationId, role: user.role });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name }, organization: { id: user.organization.id, name: user.organization.name } });
});
