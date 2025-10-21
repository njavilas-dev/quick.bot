import { edgeSchema } from '../edge'

export const preprocessBot = (bot: any) => {
  if (!bot || bot.version === '5' || bot.version === '6') return bot
  return {
    ...bot,
    version: bot.version === undefined || bot.version === null ? '3' : bot.version,
    groups: bot.groups ? bot.groups.map(preprocessGroup) : [],
    events: null,
    edges: bot.edges ? bot.edges?.filter((edge: any) => edgeSchema.safeParse(edge).success) : [],
  }
}

const preprocessGroup = (group: any) => ({
  ...group,
  blocks: group.blocks ?? [],
})

export const preprocessColumnsWidthResults = (arg: unknown) =>
  Array.isArray(arg) && arg.length === 0 ? {} : arg
