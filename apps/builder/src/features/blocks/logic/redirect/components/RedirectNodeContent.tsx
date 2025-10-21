import React from 'react'
import { Wrap } from '@chakra-ui/react'
import { RedirectBlock } from '@quickbot.io/schemas'
import { PlateText } from '@/features/blocks/bubbles/textBubble/components/plate/PlateText'

type Props = { url: NonNullable<RedirectBlock['options']>['url'] }

export const RedirectNodeContent = ({ url }: Props) => (
  <Wrap>
    <PlateText text={url ? `Redirect to ${url}` : 'Configure...'} />
  </Wrap>
)
