import React from 'react'
import { ButtonProps } from '@chakra-ui/react'
import { useToast, ButtonUpload } from '@urbiport/ui'
import { Bot } from '@quickbot.io/schemas'
import { useTranslate } from '@tolgee/react'

type BotButtonImportProps = {
  onImportBot: (bot: Bot) => void
} & ButtonProps

export const BotButtonImport = ({ onImportBot, ...props }: BotButtonImportProps) => {
  const { t } = useTranslate()
  const { showToast } = useToast()

  const handleFileSelected = async (file: File) => {
    try {
      const fileContent = await file.text()
      const bot = JSON.parse(fileContent)
      onImportBot({
        ...bot,
        events: bot.events ?? null,
        icon: bot.icon ?? null,
        name: bot.name ?? 'My New Bot',
      })
    } catch (err) {
      console.error(err)
      showToast({
        detailsTitle: t('toast.details'),
        description: t('templates.importFromFileButon.toastError.description'),
        details: {
          content: JSON.stringify(err, null, 2),
          lang: 'json',
        },
        status: 'error',
      })
    }
  }

  return <ButtonUpload accept=".json" onFileSelected={handleFileSelected} {...props} />
}
