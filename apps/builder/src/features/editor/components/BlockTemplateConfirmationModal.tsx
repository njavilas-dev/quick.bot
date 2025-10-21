import React from 'react'
import { ConfirmModal } from '@/components/ConfirmModal'
import { Text, VStack, Button, Box, Grid } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { hasBlockTemplate, getBlockTemplates } from '@/features/bot/helpers/blockTemplates'
import { BlockV6 } from '@quickbot.io/schemas'

interface BlockTemplateConfirmationModalProps {
  isOpen: boolean
  blockType: BlockV6['type'] | null
  onConfirm: (templateId?: string) => void
  onCreateBasic: () => void
  onReject: () => void
}

export const BlockTemplateConfirmationModal = ({
  isOpen,
  blockType,
  onConfirm,
  onCreateBasic,
  onReject,
}: BlockTemplateConfirmationModalProps) => {
  const { t } = useTranslate()

  if (!blockType || !hasBlockTemplate(blockType)) {
    return null
  }

  const templates = getBlockTemplates(blockType)

  const handleTemplateSelect = (templateId: string) => {
    onConfirm(templateId)
  }

  const message = (
    <VStack align="start" spacing={4} w="full" maxW="600px">
      <Text>
        {t('blockTemplate.selectMessage', {
          blockType: blockType.charAt(0).toUpperCase() + blockType.slice(1),
        })}
      </Text>

      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={3} w="full">
        {templates.map((template) => (
          <Box
            key={template.id}
            p={4}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            _hover={{ borderColor: 'green.300', bg: 'green.50' }}
            transition="all 0.2s"
          >
            <VStack align="start" spacing={3}>
              {template.icon && (
                <Box color="green.500" fontSize="24px">
                  {template.icon}
                </Box>
              )}
              <Text fontWeight="medium" fontSize="md">
                {template.title}
              </Text>
              <Text fontSize="sm" color="gray.600" lineHeight="1.4">
                {template.description}
              </Text>
              <Button
                size="sm"
                w="full"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  handleTemplateSelect(template.id)
                }}
              >
                {t('blockTemplate.useTemplate')}
              </Button>
            </VStack>
          </Box>
        ))}
      </Grid>

      <Box w="full" pt={3} borderTop="1px solid" borderColor="gray.200">
        <Button variant="ghost" onClick={onCreateBasic} w="full" size="md">
          {t('blockTemplate.createBasic')}
        </Button>
      </Box>
    </VStack>
  )

  return (
    <ConfirmModal
      isOpen={isOpen}
      onConfirm={() => {}}
      onReject={onReject}
      title={t('blockTemplate.selection.title')}
      message={message}
      confirmButtonLabel=""
      hideConfirmButton={true}
    />
  )
}
