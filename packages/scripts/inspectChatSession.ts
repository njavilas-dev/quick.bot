import { withQueryLogging } from '@quickbot.io/lib/prisma'
import { promptAndSetEnvironment } from './utils'
import * as p from '@clack/prompts'

const prismaWithLogging = withQueryLogging()

const inspectChatSession = async () => {
  await promptAndSetEnvironment('production')

  const id = await p.text({
    message: 'Session ID?',
  })

  if (!id || typeof id !== 'string') {
    console.log('No ID provided')
    return
  }

  const chatSession = await prismaWithLogging.chatSession.findFirst({
    where: {
      id,
    },
    select: {
      state: true,
    },
  })

  if (!chatSession) {
    console.log('Session not found')
    return
  }

  const result = await prismaWithLogging.botResult.findFirst({
    where: {
      id: (chatSession.state as any).botsQueue[0].resultId,
    },
  })

  console.log({
    result,
  })
}

inspectChatSession()
