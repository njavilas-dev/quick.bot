import prisma from '@quickbot.io/lib/prisma'
import { Result } from '@quickbot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from '@quickbot.io/lib/api'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PATCH') {
    const data = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as Result
    const resultId = req.query.resultId as string
    const result = await prisma.botResult.updateMany({
      where: { id: resultId },
      data,
    })
    return res.send(result)
  }
  return methodNotAllowed(res)
}

export default handler
