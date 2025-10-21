import { PublicBot, BotV6 } from '@quickbot.io/schemas'

export const convertPublicBotToBot = (bot: PublicBot, existingBot: BotV6): BotV6 => {
  if (bot.version !== '6') return existingBot
  return {
    id: bot.botId,
    version: bot.version,
    groups: bot.groups,
    edges: bot.edges,
    name: existingBot.name,
    publicId: existingBot.publicId,
    settings: bot.settings,
    theme: bot.theme,
    variables: bot.variables,
    customDomain: existingBot.customDomain,
    createdAt: existingBot.createdAt,
    updatedAt: existingBot.updatedAt,
    folderId: existingBot.folderId,
    icon: existingBot.icon,
    workspaceId: existingBot.workspaceId,
    isArchived: existingBot.isArchived,
    isClosed: existingBot.isClosed,
    resultsTablePreferences: existingBot.resultsTablePreferences,
    selectedThemeTemplateId: existingBot.selectedThemeTemplateId,
    whatsAppCredentialsId: existingBot.whatsAppCredentialsId,
    riskLevel: existingBot.riskLevel,
    events: bot.events,
  }
}
