import { NextApiRequest, NextApiResponse } from 'next'
import { checkDatabaseConnection } from '@quickbot.io/lib/checkDatabaseConnection'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  res.setHeader('Access-Control-Allow-Origin', '*');

  const dbConnected = await checkDatabaseConnection()

  if (!dbConnected) {
    return res.status(503).json({ status: 'error', message: 'Database connection failed' })
  }

  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
}
