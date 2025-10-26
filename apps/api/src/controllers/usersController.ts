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
  });
  const usersNoPassword = users.map(({ passwordHash, ...rest }) => rest);

  res.json(usersNoPassword);
}

export async function getUser(req: Request, res: Response) {
  const { userName } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { userName: String(userName) },
    });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    const { passwordHash: _, ...userNoPassword } = user;
    return res.status(200).json(userNoPassword);
  } catch (err) {
    console.error("getUser error:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function createUser(req: Request, res: Response) {
  const { name, userName, email, password } = req.body;
  if (!name || !email || !password || !userName)
    return res
      .status(400)
      .json({ error: "nome, email, password e username são obrigatorios" });

  if (!emailRegex.test(String(email).toLowerCase())) {
    return res.status(400).json({ error: "Formato de email invalido" });
  }

  try {
    const existingEmailAccount = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });
    if (existingEmailAccount) {
      // Initial validation
      return res.status(409).json({ error: "Email já registrado. " });
    }

    const existingUserNameAccount = await prisma.user.findUnique({
      where: { userName: String(userName).trim() },
    });
    if (existingUserNameAccount) {
      return res.status(409).json({ error: "Username já registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        userName,
        email,
        passwordHash: hashedPassword,
      },
    });
    const { passwordHash: _, ...userNoPassword } = user;
    res.status(201).json(userNoPassword);
  } catch (err: any) {
    // Extra validation
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Email já registrado" });
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
    return res
      .status(404)
      .json({ error: `Usuário com username: ${userName} não encontrado` });
  }
  const authUser = (req as any).user;
  if (!authUser || !authUser.id) {
    return res.status(401).json({ error: "Usuário não autorizado" });
  }

  if (authUser.id !== userFound.id) {
    return res
      .status(403)
      .json({ error: "Forbidden: não é possivel dar update em outro usuário" });
  }

  const { name, userName: newUserName, email, profileType } = req.body ?? {};
  if (!name && !email && !profileType && !newUserName) {
    return res.status(400).json({ error: "Nenhuma mudança encontrada" });
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
      return res.status(400).json({ error: "Formato de email invalido" });
    }
    const existingUser = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });
    if (existingUser) {
      return res.status(404).json({ error: "Email já registrado" });
    }
    data.email = String(email).toLowerCase().trim();
  }
  if (profileType) {
    const pt = String(profileType).toUpperCase();
    if (!allowedProfileType.includes(pt as any)) {
      return res.status(404).json({ error: "Profile type invalido" });
    }
    data.profileType = pt;
  }
  try {
    const user = await prisma.user.update({
      where: { id: userFound.id },
      data,
    });
    const { passwordHash: _, ...userNoPassword } = user;
    return res.status(200).json(userNoPassword);
  } catch (err: any) {
    if (err.code === "P2025")
      return res.status(404).json({ error: "Usuário não encontrado" });
    if (err.code === "P2002")
      return res.status(409).json({ error: "Email já registrado" });
    throw err;
  }
}

export async function deleteUser(req: Request, res: Response) {
  const { userName } = req.params;
  const userFound = await prisma.user.findUnique({
    where: { userName: String(userName).trim() },
  });
  if (!userFound) {
    return res
      .status(404)
      .json({ error: `Usuário com username: ${userName} não encontrado` });
  }
  const authUser = (req as any).user;
  if (!authUser || !authUser.id) {
    return res.status(401).json({ error: "Usuário não autorizado" });
  }
  if (authUser.id !== userFound.id) {
    return res
      .status(403)
      .json({ error: "Forbidden: não é possivel dar update em outro usuário" });
  }
  try {
    // adicionar verificação de session
    await prisma.user.delete({ where: { id: userFound.id } });
    // adicionar cleanup de session
    res.status(204).json();
  } catch (err: any) {
    if (err.code === "P2025")
      return res.status(404).json({ error: "Usuário não encontrado" });
    throw err;
  }
}
