import { Router, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { sign, Secret, SignOptions } from 'jsonwebtoken'
import dotenv from 'dotenv'
import { prisma } from '../prisma'
dotenv.config()
const router: Router = Router()

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado.' })
    }

    if (user.profileType == null) {
      return res.status(403).json({
        message: "Configuração de perfil pendente.",
        code: "PROFILE_TYPE_NULL" // TODO: anotar na documentação da api pro front verificar
      })
    }

    const hashedPassword: string = user.passwordHash
    if (!hashedPassword) {
      console.error('User found but no passwordHash column present for user:', user.id)
      return res.status(500).json({ message: 'Conta inválida no banco (senha ausente). Verifique a migração do Prisma.' })
    }

    const senhaValida = await bcrypt.compare(password, hashedPassword)
    if (!senhaValida) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' })
    }

  const secret: Secret = process.env.JWT_SECRET as Secret
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRATION ?? '1h') as SignOptions['expiresIn'] }

    const token = sign(
      { id: user.id },
      secret,
      options
    )

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro interno no servidor.' })
  }
})

export default router
