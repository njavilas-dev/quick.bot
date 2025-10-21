import React from 'react'
import { BlockIcon } from './BlockIcon'
import { BillingPlanType } from '@quickbot.io/prisma'
import { useWorkspace } from '@/hooks/useWorkspace'
import { BlockLabel } from './BlockLabel'
import { useTranslate } from '@tolgee/react'
import { BubbleBlockType } from '@quickbot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@quickbot.io/schemas/features/blocks/inputs/constants'
import { IntegrationBlockType } from '@quickbot.io/schemas/features/blocks/integrations/constants'
import { LogicBlockType } from '@quickbot.io/schemas/features/blocks/logic/constants'
import { BlockV6 } from '@quickbot.io/schemas'
import { BlockCardLayout } from './BlockCardLayout'
import { ForgedBlockCard } from '@/features/forge/ForgedBlockCard'
import { isForgedBlockType } from '@quickbot.io/schemas/features/blocks/forged/helpers'
import UpgradePlan from '@/features/billing/components/UpgradePlan'

type Props = {
  type: BlockV6['type']
  tooltip?: string
  isDisabled?: boolean
  children: React.ReactNode
  onMouseDown: (e: React.MouseEvent, type: BlockV6['type']) => void
}

export const BlockCard = (props: Pick<Props, 'type' | 'onMouseDown'>): JSX.Element => {
  const { t } = useTranslate()
  const { workspace } = useWorkspace()

  if (isForgedBlockType(props.type)) {
    return <ForgedBlockCard type={props.type} onMouseDown={props.onMouseDown} />
  }
  switch (props.type) {
    case BubbleBlockType.EMBED:
      return (
        <BlockCardLayout {...props} tooltip={t('blocks.bubbles.embed.blockCard.tooltip')}>
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      )
    case InputBlockType.FILE: {
      return !workspace?.billingPlan?.allowCustomDomain ? (
        <UpgradePlan
          excludedPlans={[BillingPlanType.FREE, BillingPlanType.PERSONAL]}
          trigger={({ onOpen }) => (
            <div onClick={onOpen}>
              <BlockCardLayout {...props} onMouseDown={onOpen} tooltip={t('billing.upgradeLimitLabel', { type: t('billing.limitMessage.fileUpload') })}>
                <BlockIcon type={props.type} />
                <BlockLabel type={props.type} />
              </BlockCardLayout>
            </div>
          )}
        />
      ) : (
        <BlockCardLayout {...props} tooltip={t('blocks.inputs.fileUpload.blockCard.tooltip')}>
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      )
    }
    case LogicBlockType.SCRIPT:
      return (
        <BlockCardLayout {...props} tooltip={t('editor.blockCard.logicBlock.tooltip.code.label')}>
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      )
    case LogicBlockType.BOT_LINK:
      return (
        <BlockCardLayout
          {...props}
          tooltip={t('editor.blockCard.logicBlock.tooltip.botLink.label')}
        >
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      )
    case LogicBlockType.JUMP:
      return (
        <BlockCardLayout {...props} tooltip={t('editor.blockCard.logicBlock.tooltip.jump.label')}>
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      )
    case IntegrationBlockType.GOOGLE_SHEETS:
      return (
        <BlockCardLayout
          {...props}
          tooltip={t('blocks.integrations.googleSheets.blockCard.tooltip')}
        >
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      )
    case IntegrationBlockType.GOOGLE_ANALYTICS:
      return (
        <BlockCardLayout
          {...props}
          tooltip={t('blocks.integrations.googleAnalytics.blockCard.tooltip')}
        >
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      )
    default:
      return (
        <BlockCardLayout {...props}>
          <BlockIcon type={props.type} />
          <BlockLabel type={props.type} />
        </BlockCardLayout>
      )
  }
}
