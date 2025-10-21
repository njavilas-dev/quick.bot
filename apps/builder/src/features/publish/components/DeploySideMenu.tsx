import React from 'react'
import { Text, Button, Stack } from '@chakra-ui/react'
import { SidebarSlide } from '@urbiport/ui'
import { useTranslate } from '@tolgee/react'
import { EditPublicId } from './EditPublicId'
import { EditCustomDomain } from './EditCustomDomain'
import { integrationsList } from './embeds/integrationsList'
import { env } from '@quickbot.io/env'

interface DeploySideMenuProps {
  selectedIndex: number
  onSelect: (index: number) => void
}

export const DeploySideMenu: React.FC<DeploySideMenuProps> = ({
  selectedIndex,
  onSelect,
}) => {
  const { t } = useTranslate()
  return (
    <SidebarSlide
      title="Deploy"
      labels={{
        unlockTooltip: t('editor.sidebarBlocks.sidebar.unlock.label'),
        lockTooltip: t('editor.sidebarBlocks.sidebar.lock.label'),
        unlockIconAriaLabel: t('editor.sidebarBlocks.sidebar.icon.unlock.label'),
        lockIconAriaLabel: t('editor.sidebarBlocks.sidebar.icon.lock.label'),
      }}
    >
      <Stack spacing={4}>
        <Text fontWeight="500">Your bot link</Text>
        <EditPublicId />
        {env.NEXT_PUBLIC_BETA_ENV && (
          <>
            <Text fontWeight="500">Your bot domain</Text>
            <EditCustomDomain />
          </>
        )}
      </Stack>
      <Text fontWeight="500">Embed your bot</Text>
      {integrationsList.map((integration, index) => {

        if (integration.hidden) return null

        const isActive = selectedIndex === index
        return (
          <Button
            key={index}
            variant="outline"
            justifyContent="start"
            size="lg"
            pt={8}
            pb={8}
            gap={4}
            isActive={isActive}
            onClick={() => onSelect(index)}
            leftIcon={integration.logo}
          >
            {integration.label}
          </Button>
        )
      })}
    </SidebarSlide>
  )
}
