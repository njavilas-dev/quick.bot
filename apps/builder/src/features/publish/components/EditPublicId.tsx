import { useToast } from '@urbiport/ui'
import { env } from '@quickbot.io/env'
import { InputURL } from '@urbiport/ui'
import { useBot } from '@/features/editor/providers/BotProvider'
import { parseDefaultPublicId } from '../helpers/parseDefaultPublicId'
import { isPublicDomainAvailableQuery } from '../queries/isPublicDomainAvailableQuery'
import { useTranslate } from '@tolgee/react'

export const EditPublicId: React.FC = () => {
  const { t } = useTranslate()
  const { bot, updateBot } = useBot()
  const { showToast } = useToast()

  const generatedPublicId: string = bot ? bot.publicId ?? parseDefaultPublicId(bot.name, bot.id) : ''

  const handlePublicIdSave = async (newPublicId: string) => {
    if (!newPublicId.trim()) {
      showToast({
        detailsTitle: t('toast.details'),
        description: 'Public ID cannot be empty.',
        status: 'error',
      })
      return
    }

    if (newPublicId.length < 4) {
      showToast({
        detailsTitle: t('toast.details'),
        description: 'Should be longer than 4 characters',
        status: 'error',
      })
      return
    }

    const { data } = await isPublicDomainAvailableQuery(newPublicId)

    if (!data?.isAvailable) {
      showToast({
        detailsTitle: t('toast.details'),
        description: 'ID is already taken',
        status: 'error',
      })
      return
    }

    updateBot({ updates: { publicId: newPublicId }, save: true })
  }

  const handlePublicURLCopy = (newPublicURL: string): void => {
    navigator.clipboard.writeText(newPublicURL)
    showToast({
      detailsTitle: t('toast.details'),
      description: 'Copied to clipboard!',
      status: 'success',
    })
  }

  return (
    <InputURL
      baseURL={`${env.NEXT_PUBLIC_VIEWER_URL[0]}`}
      pathURL={generatedPublicId}
      onSave={handlePublicIdSave}
      onCopy={handlePublicURLCopy}
    />
  )
}
