import { withQueryLogging } from '@quickbot.io/lib/prisma'
import * as p from '@clack/prompts'
import { promptAndSetEnvironment } from './utils'

const prismaWithLogging = withQueryLogging()

const deleteChatSession = async () => {
  await promptAndSetEnvironment('production')

  const id = await p.text({
    message: 'Session ID?',
  })

  if (!id || typeof id !== 'string') {
    console.log('No ID provided')
    return
  }

  const chatSession = await prismaWithLogging.chatSession.delete({
    where: {
      id,
    },
  })

  console.log(JSON.stringify(chatSession, null, 2))
}

deleteChatSession()
