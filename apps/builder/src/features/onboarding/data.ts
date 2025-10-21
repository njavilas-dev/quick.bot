import { Block } from '@quickbot.io/schemas'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'

type Feature = 'editor' | Block['type']

export const onboardingVideos: Partial<
  Record<
    Feature,
    | {
      key: string
      youtubeId: string
      deployedAt: Date
    }
    | undefined
  >
> = {
  editor: {
    key: 'editor',
    youtubeId: 'NpEaa2P7qZI',
    deployedAt: new Date('2024-06-04'),
  },
  [IntegrationBlockType.ZAPIER]: {
    key: IntegrationBlockType.ZAPIER,
    youtubeId: 'NpEaa2P7qZI',
    deployedAt: new Date('2024-06-04'),
  },
  [IntegrationBlockType.MAKE_COM]: {
    key: IntegrationBlockType.MAKE_COM,
    youtubeId: 'NpEaa2P7qZI',
    deployedAt: new Date('2024-06-04'),
  },
}
