import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { sign, Secret, SignOptions } from 'jsonwebtoken'
import dotenv from 'dotenv'
import { prisma } from '../prisma'
dotenv.config()
const router: Router = Router()

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({ message: 'Campos ausentes.' })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' })
    }

    // Ensure the user record has a passwordHash (database/schema might be missing this column)
    const dbPassword: string | undefined = (user as any).passwordHash
    if (!dbPassword) {
      console.error('User found but no passwordHash column present for user:', user.id)
      return res.status(500).json({ message: 'Conta inválida no banco (senha ausente). Verifique a migração do Prisma.' })
    }

    const senhaValida = await bcrypt.compare(senha, dbPassword)
    if (!senhaValida) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' })
    }

    const secret: Secret = process.env.JWT_SECRET as Secret
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRATION ?? '1h') as SignOptions['expiresIn'] }

    const profileType = (user as any).profileType ?? 'jogador'

    const token = sign(
      { id: user.id, profileType },
      secret,
      options
    )

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        profileType,
        email: user.email
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro interno no servidor.' })
  }
})

export default router
