import { withQueryLogging } from '@quickbot.io/lib/prisma'
import { promptAndSetEnvironment } from './utils'
import * as p from '@clack/prompts'

const prismaWithLogging = withQueryLogging()

const updateWorkspace = async () => {
  await promptAndSetEnvironment('production')

  const workspaceId = (await p.text({
    message: 'Workspace ID?',
  })) as string

  const workspace = await prismaWithLogging.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      isVerified: true,
    },
  })

  console.log(workspace)
}

updateWorkspace()
