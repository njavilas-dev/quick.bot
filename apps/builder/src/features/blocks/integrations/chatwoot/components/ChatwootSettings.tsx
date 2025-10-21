import { InputTextWithVariables } from '@/components/inputs'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Stack,
} from '@chakra-ui/react'
import { ChatwootBlock } from '@quickbot.io/schemas'
import {
  chatwootTasks,
  defaultChatwootOptions,
} from '@quickbot.io/schemas/features/blocks/integrations/chatwoot/constants'
import { FormControl, Select } from '@urbiport/ui'
import React from 'react'

type Props = {
  options: ChatwootBlock['options']
  onOptionsChange: (options: ChatwootBlock['options']) => void
}

export const ChatwootSettings = ({ options, onOptionsChange }: Props) => {
  const updateTask = (task: (typeof chatwootTasks)[number]) => {
    onOptionsChange({ ...options, task })
  }

  const task = options?.task ?? defaultChatwootOptions.task

  return (
    <Stack spacing={6}>
      <FormControl>
        <Select
          selectedItem={options?.task ?? defaultChatwootOptions.task}
          onSelect={updateTask}
          items={chatwootTasks}
        />
      </FormControl>
      {task === 'Show widget' && (
        <>
          <FormControl isRequired label="Base URL">
            <InputTextWithVariables
              defaultValue={options?.baseUrl ?? defaultChatwootOptions.baseUrl}
              onChange={(baseUrl: string) => {
                onOptionsChange({ ...options, baseUrl })
              }}
            />
          </FormControl>
          <FormControl
            isRequired
            label="Website token"
            moreInfoTooltip="Can be found in Chatwoot under Settings > Inboxes > Settings > Configuration, in the code snippet."
          >
            <InputTextWithVariables
              defaultValue={options?.websiteToken}
              onChange={(websiteToken) => onOptionsChange({ ...options, websiteToken })}
            />
          </FormControl>
          <Accordion allowMultiple>
            <AccordionItem>
              <AccordionButton>
                Set user details
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <FormControl label="ID">
                  <InputTextWithVariables
                    defaultValue={options?.user?.id}
                    onChange={(id: string) => {
                      onOptionsChange({
                        ...options,
                        user: { ...options?.user, id },
                      })
                    }}
                  />
                </FormControl>
                <FormControl label="Name">
                  <InputTextWithVariables
                    defaultValue={options?.user?.name}
                    onChange={(name: string) => {
                      onOptionsChange({
                        ...options,
                        user: { ...options?.user, name },
                      })
                    }}
                  />
                </FormControl>
                <FormControl label="Email">
                  <InputTextWithVariables
                    defaultValue={options?.user?.email}
                    onChange={(email: string) => {
                      onOptionsChange({
                        ...options,
                        user: { ...options?.user, email },
                      })
                    }}
                  />
                </FormControl>
                <FormControl label="Avatar URL">
                  <InputTextWithVariables
                    defaultValue={options?.user?.avatarUrl}
                    onChange={(avatarUrl: string) => {
                      onOptionsChange({
                        ...options,
                        user: { ...options?.user, avatarUrl },
                      })
                    }}
                  />
                </FormControl>
                <FormControl label="Phone number">
                  <InputTextWithVariables
                    defaultValue={options?.user?.phoneNumber}
                    onChange={(phoneNumber: string) => {
                      onOptionsChange({
                        ...options,
                        user: { ...options?.user, phoneNumber },
                      })
                    }}
                  />
                </FormControl>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </>
      )}
    </Stack>
  )
}
