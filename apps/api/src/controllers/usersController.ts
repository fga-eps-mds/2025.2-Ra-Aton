import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { emit } from "process";
import { profile } from "console";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedProfileType = ["JOGADOR", "TORCEDOR", "ATLETICA"] as const;

export async function listUsers(_req: Request, res: Response) {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      profileType: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  res.json(users);
}

export async function getUser(req: Request, res: Response) {
  const { id } = req.params;

  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({ error: "Invalid id format" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        profileType: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(200).json(user);
  } catch (err) {
    console.error("getUser error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function createUser(req: Request, res: Response) {
  const { name, email, password, profileType } = req.body;
  if (!name || !email || !password || !profileType)
    return res
      .status(400)
      .json({ error: "name, email, password and profile type are required" });

  const pt = String(profileType).toUpperCase();
  if (!allowedProfileType.includes(pt as any)) {
    return res.status(404).json({ error: "Invalid profile type" });
  }

  if (!emailRegex.test(String(email).toLowerCase())) {
    return res.status(404).json({ error: "Invalid email format" });
  }

  try {
    const existingAccount = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });
    if (existingAccount) {
      // Initial validation
      return res.status(404).json({ error: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profileType: profileType,
      },
    });
    res.status(201).json(user);
  } catch (err: any) {
    // Extra validation
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Email already in use" });
    }
    throw err;
  }
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const authUser = (req as any).user;
  if (!authUser || !authUser.id) {
    return res.status(401).json({ error: "Unauthorized user" });
  }
  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({ error: "Invalid id format" });
  }
  if (authUser.id !== id) {
    return res
      .status(403)
      .json({ error: "Forbidden: cannot update other user" });
  }

  const { name, email, profileType } = req.body ?? {};
  if (!name && !email && !profileType) {
    return res.status(400).json({ error: "Nothing to change" });
  }
  const data: any = {};
  if (name) {
    data.name = String(name).trim();
  }
  if (email) {
    if (!emailRegex.test(String(email).toLowerCase())) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    const existingUser = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });
    if (existingUser) {
      return res.status(404).json({ error: "Email already in use"});
    }
    data.email = String(email).toLowerCase().trim();
  }
  if (profileType) {
    const pt = String(profileType).toUpperCase();
    if (!allowedProfileType.includes(pt as any)) {
      return res.status(404).json({ error: "Invalid profile type"})
    }
    data.profileType = pt;
  }
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        profileType: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    return res.status(200).json(user);
  } catch (err: any) {
    if (err.code === "P2025")
      return res.status(404).json({ error: "User not found" });
    if (err.code === "P2002")
      return res.status(409).json({ error: "Email already in use" });
    if (err.code === "P2025")
      return res.status(404).json({ error: "User not found" });
    if (err.code === "P2002")
      return res.status(409).json({ error: "Email already in use" });
    throw err;
  }
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;
  const authUser = (req as any).user;
  if (!authUser || !authUser.id) {
    return res.status(401).json({ error: "Unauthorized user" });
  }
  if (!id || !uuidRegex.test(id)) {
    return res.status(400).json({ error: "Invalid id format" });
  }
  if (authUser.id !== id) {
    return res
      .status(403)
      .json({ error: "Forbidden: cannot update other user" });
  }
  try {
    // adicionar verificação de session
    await prisma.user.delete({ where: { id } });
    // adicionar cleanup de session
    res.status(204).send();
  } catch (err: any) {
    if (err.code === "P2025")
      return res.status(404).json({ error: "User not found" });
    if (err.code === "P2025")
      return res.status(404).json({ error: "User not found" });
    throw err;
  }
}
