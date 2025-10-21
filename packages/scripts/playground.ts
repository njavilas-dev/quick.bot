import { withQueryLogging } from '@quickbot.io/lib/prisma'
import { promptAndSetEnvironment } from './utils'

const prismaWithLogging = withQueryLogging()

const executePlayground = async () => {
  await promptAndSetEnvironment()

  const result = await prismaWithLogging.workspace.findMany({
    where: {
      members: {
        some: {
          user: {
            email: '',
          },
        },
      },
    },
    include: {
      members: true,
      bots: {
        select: {
          name: true,
          riskLevel: true,
          id: true,
        },
      },
    },
  })
  console.log(JSON.stringify(result))

  // await prisma.bannedIp.deleteMany({})

  // const result = await prisma.coupon.findMany({
  //   where: {
  //     code: '',
  //   },
  // })
}

executePlayground()
