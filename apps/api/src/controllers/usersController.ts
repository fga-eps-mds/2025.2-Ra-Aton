import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";

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
      userName: true,
      email: true,
      profileType: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  res.json(users);
}

export async function getUser(req: Request, res: Response) {
  const { userName } = req.params;
  console.log("username:" + userName);
  try {
    const user = await prisma.user.findUnique({
      where: { userName: String(userName) },
      select: {
        id: true,
        name: true,
        userName: true,
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
  const { name, userName, email, password } = req.body;
  if (!name || !email || !password || !userName)
    return res
      .status(400)
      .json({ error: "name, email, password and username are required" });

  if (!emailRegex.test(String(email).toLowerCase())) {
    return res.status(404).json({ error: "Invalid email format" });
  }

  try {
    const existingEmailAccount = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });
    if (existingEmailAccount) {
      // Initial validation
      return res.status(404).json({ error: "Email already in use" });
    }

    const existingUserNameAccount = await prisma.user.findUnique({
      where: { userName: String(userName).trim() },
    });
    if (existingUserNameAccount) {
      return res.status(404).json({ error: "Username already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        userName,
        email,
        password: hashedPassword,
      },
    });
    const {password: _, ...userNoPassword } = user;
    res.status(201).json(userNoPassword);
  } catch (err: any) {
    // Extra validation
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Email already in use" });
    }
    throw err;
  }
}

export async function updateUser(req: Request, res: Response) {
  const { userName } = req.params;
  const userFound = await prisma.user.findUnique({
    where: { userName: String(userName).trim() },
  });
  if (!userFound) {
    return res.status(404).json({ error: `User with ${userName} not found` });
  }
  const authUser = (req as any).user;
  if (!authUser || !authUser.id) {
    return res.status(401).json({ error: "Unauthorized user" });
  }

  if (authUser.id !== userFound.id) {
    return res
      .status(403)
      .json({ error: "Forbidden: cannot update other user" });
  }

  const { name, newUserName, email, profileType } = req.body ?? {};
  if (!name && !email && !profileType && !newUserName) {
    return res.status(400).json({ error: "Nothing to change" });
  }
  const data: any = {};
  if (name) {
    data.name = String(name).trim();
  }
  if (newUserName) {
    data.userName = String(newUserName);
  }
  if (email) {
    if (!emailRegex.test(String(email).toLowerCase())) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    const existingUser = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });
    if (existingUser) {
      return res.status(404).json({ error: "Email already in use" });
    }
    data.email = String(email).toLowerCase().trim();
  }
  if (profileType) {
    const pt = String(profileType).toUpperCase();
    if (!allowedProfileType.includes(pt as any)) {
      return res.status(404).json({ error: "Invalid profile type" });
    }
    data.profileType = pt;
  }
  try {
    const user = await prisma.user.update({
      where: { id: userFound.id },
      data,
      select: {
        id: true,
        name: true,
        userName: true,
        email: true,
        profileType: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return res.status(200).json(user);
  } catch (err: any) {
    if (err.code === "P2025")
      return res.status(404).json({ error: "User not found" });
    if (err.code === "P2002")
      return res.status(409).json({ error: "Email already in use" });
    throw err;
  }
}

export async function deleteUser(req: Request, res: Response) {
  const { userName } = req.params;
  const userFound = await prisma.user.findUnique({
    where: { userName: String(userName).trim() },
  });
  if (!userFound) {
    return res.status(404).json({ error: `User with ${userName} not found` });
  }
  const authUser = (req as any).user;
  if (!authUser || !authUser.id) {
    return res.status(401).json({ error: "Unauthorized user" });
  }
  if (authUser.id !== userFound.id) {
    return res
      .status(403)
      .json({ error: "Forbidden: cannot update other user" });
  }
  try {
    // adicionar verificação de session
    await prisma.user.delete({ where: { id: userFound.id } });
    // adicionar cleanup de session
    res.status(204).send();
  } catch (err: any) {
    if (err.code === "P2025")
      return res.status(404).json({ error: "User not found" });
    throw err;
  }
}
