import prisma from '@quickbot.io/lib/prisma'

type Props = {
  workspaceId: string
  credentialsId: string
}

type SettingsPublicBot = {
  publicBotId: string
  settings: string
}

export const getSettingsPublicBotForWhatsappCredentials = async ({
  workspaceId,
  credentialsId,
}: Props): Promise<SettingsPublicBot> => {
  const publicBot = await prisma.botPublic.findFirst({
    where: {
      bot: { workspaceId, whatsAppCredentialsId: credentialsId },
    },
    select: {
      settings: true,
      bot: {
        select: {
          publicId: true,
        },
      },
    },
  })

  if (!publicBot) {
    throw new Error(
      `Dont exist a public bot for whatsapp credential ${credentialsId} in workspace ${workspaceId}`,
    )
  }

  return {
    publicBotId: publicBot.bot.publicId!,
    settings: JSON.stringify(publicBot.settings),
  }
}
