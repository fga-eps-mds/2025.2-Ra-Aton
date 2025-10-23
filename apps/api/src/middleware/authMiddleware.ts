import { Request, Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['authorization']
  //const token = authHeader && authHeader.split(' ')[1] <- Não tava funcionando
  console.log(token);
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido.' })
  }

  try {
    const secret: import('jsonwebtoken').Secret = process.env.JWT_SECRET as unknown as import('jsonwebtoken').Secret
    const decoded = verify(token, secret)
    ;(req as any).user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido.' })
  }
};