import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
  Tag,
  Text,
  chakra,
} from '@chakra-ui/react'
import { Standard } from '@urbiport/nextjs'
import { Bot } from '@quickbot.io/schemas'
import React, { useCallback, useEffect, useState } from 'react'
import { useTemplates } from '../hooks/useTemplates'
import { TemplateProps } from '../types'
import { H3, H4, useToast } from '@urbiport/ui'
import { sendRequest } from '@quickbot.io/lib'
import { useTranslate } from '@tolgee/react'
import { BotIcon } from '@/components/BotIcon'

type Props = {
  isOpen: boolean
  onClose: () => void
  onBotChoose: (bot: Bot) => void
  isLoading: boolean
}

export const TemplatesModal = ({ isOpen, onClose, onBotChoose, isLoading }: Props) => {
  const { t } = useTranslate()
  const [bot, setBot] = useState<Bot>()
  const templates = useTemplates()
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateProps>(templates[0])
  const [isFirstTemplateLoaded, setIsFirstTemplateLoaded] = useState(false)
  const { showToast } = useToast()

  const fetchTemplate = useCallback(
    async (template: TemplateProps) => {
      setSelectedTemplate(template)
      const { data, error } = await sendRequest(`/templates/${template.fileName}`)
      if (error)
        return showToast({
          detailsTitle: t('toast.details'),
          title: error.name,
          description: error.message,
        })
      setBot({ ...(data as Bot), name: template.name })
    },
    [showToast, t],
  )

  useEffect(() => {
    if (isFirstTemplateLoaded) return
    setIsFirstTemplateLoaded(true)
    fetchTemplate(templates[0])
  }, [fetchTemplate, templates, isFirstTemplateLoaded])

  const onUseThisTemplateClick = async () => {
    if (!bot) return
    onBotChoose(bot)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} blockScrollOnMount={false} size="6xl">
      <ModalOverlay />
      <ModalContent h="85vh">
        <ModalBody
          h="full"
          as={HStack}
          p="0"
          spacing="0"
          shadow="md"
          borderColor="divider.light"
          borderWidth={1}
          borderRadius="lg"
          overflow="hidden"
        >
          <Stack
            bgColor="bg.dark"
            h="full"
            w="300px"
            py="6"
            px="4"
            borderRightWidth={1}
            borderColor="divider.light"
            justify="space-between"
            flexShrink={0}
            overflowY="auto"
          >
            <Stack spacing={5}>
              <Stack spacing={2}>
                <H4>{t('templates.modal.menuHeading.marketing')}</H4>
                {templates
                  .filter((template) => template.category === 'marketing')
                  .map((template) => (
                    <Button
                      key={template.name}
                      size="sm"
                      onClick={() => fetchTemplate(template)}
                      w="full"
                      variant="ghost"
                      justifyContent="flex-start"
                      isActive={selectedTemplate.name === template.name}
                      isDisabled={template.isComingSoon}
                      leftIcon={<BotIcon icon={template.emoji} size="xs" />}
                    >
                      <Text>{template.name}</Text>
                      {template.isNew && (
                        <Tag variant="orange" flexShrink={0}>
                          {t('templates.modal.menuHeading.new.tag')}
                        </Tag>
                      )}
                    </Button>
                  ))}
              </Stack>
              <Stack spacing={2}>
                <H4>{t('templates.modal.menuHeading.product')}</H4>
                {templates
                  .filter((template) => template.category === 'product')
                  .map((template) => (
                    <Button
                      key={template.name}
                      size="sm"
                      onClick={() => fetchTemplate(template)}
                      w="full"
                      variant="ghost"
                      justifyContent="flex-start"
                      isActive={selectedTemplate.name === template.name}
                      isDisabled={template.isComingSoon}
                      leftIcon={<BotIcon icon={template.emoji} size="xs" />}
                    >
                      <Text>{template.name}</Text>
                      {template.isNew && (
                        <Tag variant="orange" flexShrink={0}>
                          {t('templates.modal.menuHeading.new.tag')}
                        </Tag>
                      )}
                    </Button>
                  ))}
              </Stack>
              <Stack spacing={2}>
                <H4>{t('templates.modal.menuHeading.other')}</H4>
                {templates
                  .filter((template) => template.category === undefined)
                  .map((template) => (
                    <Button
                      size="sm"
                      key={template.name}
                      onClick={() => fetchTemplate(template)}
                      w="full"
                      variant={selectedTemplate.name === template.name ? 'solid' : 'ghost'}
                      isDisabled={template.isComingSoon}
                    >
                      <HStack overflow="hidden" fontSize="sm" w="full">
                        <Text>{template.emoji}</Text>
                        <Text>{template.name}</Text>
                        {template.isNew && (
                          <Tag variant="orange" flexShrink={0}>
                            {t('templates.modal.menuHeading.new.tag')}
                          </Tag>
                        )}
                      </HStack>
                    </Button>
                  ))}
              </Stack>
            </Stack>
          </Stack>
          <Stack
            h="full"
            w="255px"
            py="6"
            px="4"
            borderRightWidth={1}
            borderColor="divider.light"
            justify="space-between"
            flexShrink={0}
            overflowY="auto"
          >
            <Stack spacing={5}>
              <H3>
                <BotIcon icon={selectedTemplate.emoji} size="sm" />
                <chakra.span ml="2">{selectedTemplate.name}</chakra.span>
              </H3>
              <Text color="text.light">{selectedTemplate.description}</Text>
            </Stack>
            <Button onClick={onUseThisTemplateClick} isLoading={isLoading}>
              {t('templates.modal.useTemplateButton.label')}
            </Button>
          </Stack>
          <Stack w="full" h="full" align="center" bgColor="bg.normal">
            {bot && <Standard key={bot.id} bot={bot} />}
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
