import { withQueryLogging } from '@quickbot.io/lib/prisma'
import * as p from '@clack/prompts'
import { promptAndSetEnvironment } from './utils'
import cliProgress from 'cli-progress'
import { writeFileSync } from 'fs'
import { ResultWithAnswers, BotV6, resultWithAnswersSchema } from '@quickbot.io/schemas'
import { byId } from '@quickbot.io/lib'
import { parseResultHeader } from '@quickbot.io/results/parseResultHeader'
import { convertResultsToTableData } from '@quickbot.io/results/convertResultsToTableData'
import { parseBlockIdVariableIdMap } from '@quickbot.io/results/parseBlockIdVariableIdMap'
import { parseColumnsOrder } from '@quickbot.io/results/parseColumnsOrder'
import { parseUniqueKey } from '@quickbot.io/lib/parseUniqueKey'
import { unparse } from 'papaparse'
import { z } from 'zod'

const prismaWithLogging = withQueryLogging()

const exportResults = async () => {
  await promptAndSetEnvironment('production')

  const botId = (await p.text({
    message: 'Bot ID?',
  })) as string

  if (!botId || typeof botId !== 'string') {
    console.log('No id provided')
    return
  }

  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

  const bot = (await prismaWithLogging.bot.findUnique({
    where: {
      id: botId,
    },
  })) as BotV6 | null

  if (!bot) {
    console.log('No bot found')
    return
  }

  const totalResultsToExport = await prismaWithLogging.botResult.count({
    where: {
      botId,
      hasStarted: true,
      isArchived: false,
    },
  })

  progressBar.start(totalResultsToExport, 0)

  const results: ResultWithAnswers[] = []

  for (let skip = 0; skip < totalResultsToExport; skip += 50) {
    results.push(
      ...z.array(resultWithAnswersSchema).parse(
        (
          await prismaWithLogging.botResult.findMany({
            take: 50,
            skip,
            where: {
              botId: botId,
              hasStarted: true,
              isArchived: false,
            },
            orderBy: {
              createdAt: 'desc',
            },
            include: {
              answers: {
                select: {
                  content: true,
                  blockId: true,
                },
              },
              answersV2: {
                select: {
                  content: true,
                  blockId: true,
                },
              },
            },
          })
        ).map((r) => ({ ...r, answers: r.answersV2.concat(r.answers) })),
      ),
    )
    progressBar.increment(50)
  }

  progressBar.stop()

  writeFileSync('logs/results.json', JSON.stringify(results))

  const resultHeader = parseResultHeader(bot, [])

  const dataToUnparse = convertResultsToTableData({
    results,
    headerCells: resultHeader,
    blockIdVariableIdMap: parseBlockIdVariableIdMap(bot?.groups),
  })

  const headerIds = parseColumnsOrder(
    bot?.resultsTablePreferences?.columnsOrder,
    resultHeader,
  ).reduce<string[]>((currentHeaderIds, columnId) => {
    if (bot?.resultsTablePreferences?.columnsVisibility[columnId] === false) return currentHeaderIds
    const columnLabel = resultHeader.find((headerCell) => headerCell.id === columnId)?.id
    if (!columnLabel) return currentHeaderIds
    return [...currentHeaderIds, columnLabel]
  }, [])

  const data = dataToUnparse.map<{ [key: string]: string }>((data) => {
    const newObject: { [key: string]: string } = {}
    headerIds?.forEach((headerId) => {
      const headerLabel = resultHeader.find(byId(headerId))?.label
      if (!headerLabel) return
      const newKey = parseUniqueKey(headerLabel, Object.keys(newObject))
      newObject[newKey] = data[headerId]?.plainText
    })
    return newObject
  })

  const csv = unparse(data)

  writeFileSync('logs/results.csv', csv)
}

exportResults()
