import React from 'react'
import {
  Stack,
  useDisclosure,
  Text,
  HStack,
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
import { useWorkspace } from '@/hooks/useWorkspace'
import { CodeEditorWithVariables } from '@/components/inputs/CodeEditorWithVariables'

import { InputTextWithVariables, TextareaWithVariables } from '@/components/inputs'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { SendEmailBlock, Variable } from '@quickbot.io/schemas'
import { isNotEmpty } from '@quickbot.io/lib'
import { ForgedCredentialsDropdown } from '@/features/forge/components/credentials/ForgedCredentialsDropdown'
import { defaultSendEmailOptions } from '@quickbot.io/schemas/features/blocks/integrations/sendEmail/constants'
import { env } from '@quickbot.io/env'
import { FormControl, Switch } from '@urbiport/ui'
import { SmtpConfigModal } from './SmtpConfigModal'
import { VariablesDropdown } from '@/features/variables/components/VariablesDropdown'

type Props = {
  options: SendEmailBlock['options']
  onOptionsChange: (options: SendEmailBlock['options']) => void
}

export const SendEmailSettings = ({ options, onOptionsChange }: Props) => {
  const { workspace } = useWorkspace()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleCredentialsSelect = (credentialsId?: string) => {
    onOptionsChange({
      ...options,
      credentialsId: credentialsId === undefined ? 'default' : credentialsId,
    })
  }

  const handleToChange = (recipientsStr: string) => {
    const recipients: string[] = recipientsStr
      .split(',')
      .map((str) => str.trim())
      .filter(isNotEmpty)
    onOptionsChange({
      ...options,
      recipients,
    })
  }

  const handleCcChange = (ccStr: string) => {
    const cc: string[] = ccStr
      .split(',')
      .map((str) => str.trim())
      .filter(isNotEmpty)
    onOptionsChange({
      ...options,
      cc,
    })
  }

  const handleBccChange = (bccStr: string) => {
    const bcc: string[] = bccStr
      .split(',')
      .map((str) => str.trim())
      .filter(isNotEmpty)
    onOptionsChange({
      ...options,
      bcc,
    })
  }

  const handleSubjectChange = (subject: string) =>
    onOptionsChange({
      ...options,
      subject,
    })

  const handleBodyChange = (body: string) =>
    onOptionsChange({
      ...options,
      body,
    })

  const handleReplyToChange = (replyTo: string) =>
    onOptionsChange({
      ...options,
      replyTo,
    })

  const handleIsCustomBodyChange = (isCustomBody: boolean) =>
    onOptionsChange({
      ...options,
      isCustomBody,
    })

  const handleIsBodyCodeChange = (isBodyCode: boolean) =>
    onOptionsChange({
      ...options,
      isBodyCode,
    })

  const handleChangeAttachmentVariable = (variable: Pick<Variable, 'id' | 'name'> | undefined) =>
    onOptionsChange({
      ...options,
      attachmentsVariableId: variable?.id,
    })

  return (
    <Stack spacing={6}>
      {workspace && (
        <FormControl label="From:">
          <ForgedCredentialsDropdown
            type="smtp"
            workspaceId={workspace.id}
            currentCredentialsId={options?.credentialsId ?? defaultSendEmailOptions.credentialsId}
            onCredentialsSelect={handleCredentialsSelect}
            onCredentialsCreate={onOpen}
            defaultCredentialLabel={env.NEXT_PUBLIC_SMTP_FROM?.match(/<(.*)>/)?.pop()}
            credentialsName="SMTP account"
          />
        </FormControl>
      )}
      <FormControl label="To:">
        <InputTextWithVariables
          withVariableButton={true}
          onChange={handleToChange}
          defaultValue={options?.recipients?.join(', ')}
          placeholder="email@example.com, email2@example.com"
        />
      </FormControl>
      <FormControl label="Subject:">
        <InputTextWithVariables
          withVariableButton={true}
          onChange={handleSubjectChange}
          defaultValue={options?.subject ?? ''}
        />
      </FormControl>
      <SwitchWithRelatedSettings
        label={'Custom content?'}
        moreInfoTooltip="By default, the email body will be a recap of what has been collected so far. You can override it with this option."
        defaultValue={options?.isCustomBody ?? defaultSendEmailOptions.isCustomBody}
        onChange={handleIsCustomBodyChange}
      >
        <FormControl label="Content:">
          <HStack>
            <Text fontSize="sm">Text</Text>
            <Switch
              size="sm"
              defaultValue={options?.isBodyCode ?? defaultSendEmailOptions.isBodyCode}
              onChange={handleIsBodyCodeChange}
            />
            <Text fontSize="sm">Code</Text>
          </HStack>
        </FormControl>
        {options?.isBodyCode ? (
          <FormControl>
            <CodeEditorWithVariables
              withVariableButton={true}
              lang="html"
              defaultValue={options?.body ?? ''}
              onChange={handleBodyChange}
              minH="300px"
            />
          </FormControl>
        ) : (
          <FormControl>
            <TextareaWithVariables
              withVariableButton={true}
              defaultValue={options?.body ?? ''}
              onChange={handleBodyChange}
              minH="300px"
            />
          </FormControl>
        )}
        <FormControl
          label="Attach files:"
          moreInfoTooltip="The selected variable should have previously collected files from the File upload
                input block."
        >
          <VariablesDropdown
            initialVariableId={options?.attachmentsVariableId}
            onSelect={handleChangeAttachmentVariable}
          />
        </FormControl>
      </SwitchWithRelatedSettings>
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton>
            Advanced
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <FormControl label="Reply to:">
              <InputTextWithVariables
                withVariableButton={true}
                onChange={handleReplyToChange}
                defaultValue={options?.replyTo}
                placeholder={'email@example.com'}
              />
            </FormControl>
            <FormControl label="Cc:">
              <InputTextWithVariables
                withVariableButton={true}
                onChange={handleCcChange}
                defaultValue={options?.cc?.join(', ') ?? ''}
                placeholder="email@example.com, email2@example.com"
              />
            </FormControl>
            <FormControl label="Bcc:">
              <InputTextWithVariables
                withVariableButton={true}
                onChange={handleBccChange}
                defaultValue={options?.bcc?.join(', ') ?? ''}
                placeholder="email@example.com, email2@example.com"
              />
            </FormControl>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <SmtpConfigModal
        isOpen={isOpen}
        onClose={onClose}
        onNewCredentials={handleCredentialsSelect}
      />
    </Stack>
  )
}
