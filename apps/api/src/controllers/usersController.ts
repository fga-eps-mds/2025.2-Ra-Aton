import { Request, Response } from 'express';
import { prisma } from '../prisma';

export async function listUsers(_req: Request, res: Response) {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(users);
}

export async function getUser(req: Request, res: Response) {
  const { id } = req.params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
}

export async function createUser(req: Request, res: Response) {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
  try {
    const user = await prisma.user.create({ data: { name, email } });
    res.status(201).json(user);
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    throw err;
  }
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const user = await prisma.user.update({ where: { id }, data: { name, email } });
    res.json(user);
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'User not found' });
    if (err.code === 'P2002') return res.status(409).json({ error: 'Email already in use' });
    throw err;
  }
}

export async function deleteUser(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'User not found' });
    throw err;
  }
}
