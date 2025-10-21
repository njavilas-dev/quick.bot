import prisma from '@quickbot.io/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'
import { initMiddleware, methodNotAllowed, notFound } from '@quickbot.io/lib/api'

const cors = initMiddleware(Cors())

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method === 'GET') {
    const botId = req.query.botId as string
    const bot = await prisma.botPublic.findUnique({
      where: { botId },
    })
    if (!bot) return notFound(res)
    return res.send({ bot: bot })
  }
  methodNotAllowed(res)
}

export default handler
