import { wildcardMatch } from '@quickbot.io/lib/wildcardMatch'
import { modelsWithImageUrlSupport } from '../constants'

export const isModelCompatibleWithVision = (model: string | undefined) =>
  model ? wildcardMatch(modelsWithImageUrlSupport)(model) : false
