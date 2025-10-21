import { isCancel, text, confirm } from '@clack/prompts'
import { withQueryLogging } from '@quickbot.io/lib/prisma'
import { writeFileSync } from 'fs'
import {
  removeObjectsFromUser,
  removeObjectsFromWorkspace,
} from '@quickbot.io/lib/s3/removeObjectsRecursively'

const prismaWithLogging = withQueryLogging()

export const destroyUser = async (userEmail?: string) => {

  const email =
    userEmail ??
    (await text({
      message: 'User email?',
    }))

  if (!email || isCancel(email)) {
    console.log('No email provided')
    return
  }

  const workspaces = await prismaWithLogging.workspace.findMany({
    where: {
      members: { every: { user: { email } } },
    },
    include: {
      members: { select: { user: { select: { email: true } }, role: true } },
      bots: {
        select: {
          results: {
            select: { id: true },
          },
        },
      },
    },
  })

  console.log(`Found ${workspaces.length} workspaces`)

  if (workspaces.some((w) => w.members.some((m) => m.user.email && m.user.email !== email))) {
    console.log(`Some workspaces have other members. Something is wrong. Logging and exiting...`)
    writeFileSync('logs/workspaces-issue.json', JSON.stringify(workspaces, null, 2))
    return
  }

  console.log(
    'Workspaces:',
    JSON.stringify(
      workspaces.map((w) => ({
        id: w.id,
        plan: w.plan,
        members: w.members,
      })),
      null,
      2,
    ),
  )

  const proceed = await confirm({ message: 'Proceed?' })
  if (!proceed || typeof proceed !== 'boolean') {
    console.log('Aborting')
    return
  }

  for (const workspace of workspaces) {
    const totalResults = workspace.bots.reduce((acc, bot) => acc + bot.results.length, 0)

    if (totalResults > 0) {
      console.log(
        `Workspace ${workspace.name} has ${totalResults} results. We should delete them first...`,
      )
      const proceed = await confirm({ message: 'Proceed?' })
      if (!proceed || typeof proceed !== 'boolean') {
        console.log('Aborting')
        return
      }
    }
    for (const bot of workspace.bots.filter((t) => t.results.length > 0)) {
      for (const result of bot.results) {
        await prismaWithLogging.botResult.deleteMany({ where: { id: result.id } })
      }
    }
    await prismaWithLogging.workspace.delete({ where: { id: workspace.id } })
    await removeObjectsFromWorkspace(workspace.id)
  }

  const user = await prismaWithLogging.user.delete({ where: { email } })
  await removeObjectsFromUser(user.id)

  console.log(`User deleted.`, JSON.stringify(user, null, 2))
}
