import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { sign } from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
const router: Router = Router()

// Exemplo simples de dados (substituir por banco real depois)
const users = [
  { id: 1, name: 'João', email: 'joao@example.com', passwordHash: '$2b$10$WbLx3gLXnZyFVD7z5X6ItewE9ZVuHdAA3y2AlzT0YqIr7dd7c.dPa', profileType: 'jogador' }
]

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({ message: 'Campos ausentes.' })
    }

    const user = users.find(u => u.email === email)
    if (!user) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' })
    }

    const senhaValida = await bcrypt.compare(senha, user.passwordHash)
    if (!senhaValida) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' })
    }

    const secret: import('jsonwebtoken').Secret = process.env.JWT_SECRET as unknown as import('jsonwebtoken').Secret
  const options: import('jsonwebtoken').SignOptions = { expiresIn: (process.env.JWT_EXPIRATION ?? '1h') as import('jsonwebtoken').SignOptions['expiresIn'] }

    const token = sign(
      { id: user.id, profileType: user.profileType },
      secret,
      options
    )

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        profileType: user.profileType
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro interno no servidor.' })
  }
})

export default router
