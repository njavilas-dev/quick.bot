import { withQueryLogging } from '@quickbot.io/lib/prisma'
import { select, text, isCancel } from '@clack/prompts'
import { isEmpty } from '@quickbot.io/lib'
import { promptAndSetEnvironment } from './utils'

const prismaWithLogging = withQueryLogging()

const suspendWorkspace = async () => {
  await promptAndSetEnvironment('production')

  const type = await select<any, 'id' | 'publicId' | 'workspaceId'>({
    message: 'Select way',
    options: [
      { label: 'Bot ID', value: 'id' },
      { label: 'Bot public ID', value: 'publicId' },
      { label: 'Workspace ID', value: 'workspaceId' },
    ],
  })

  if (!type || isCancel(type)) return

  const val = await text({
    message: 'Enter value',
  })

  if (!val || isCancel(val)) return

  let workspaceId = type === 'workspaceId' ? val : undefined

  if (!workspaceId) {
    const bot = await prismaWithLogging.bot.findFirst({
      where: {
        [type]: val,
      },
      select: {
        workspaceId: true,
      },
    })

    if (!bot) {
      console.log('Bot not found')
      return
    }

    workspaceId = bot.workspaceId
  }

  if (isEmpty(workspaceId)) {
    console.log('Workspace not found')
    return
  }

  const result = await prismaWithLogging.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      isSuspended: true,
    },
  })

  console.log(JSON.stringify(result, null, 2))
}

suspendWorkspace()
