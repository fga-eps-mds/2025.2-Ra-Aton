import { hash } from 'bcrypt'
import { prisma } from '../prisma'

async function main() {
  const rawPassword = process.env.SEED_PASSWORD ?? 'senha123'
  const email = process.env.SEED_EMAIL ?? 'teste@example.com'
  const name = process.env.SEED_NAME ?? 'Usuário Teste'

  const passwordHash = await hash(rawPassword, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { name, email, passwordHash },
  })

  console.log('Seeded user:', { id: user.id, email: user.email })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
