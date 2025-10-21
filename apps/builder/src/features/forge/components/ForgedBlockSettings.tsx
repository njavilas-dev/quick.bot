import { Stack, useDisclosure } from '@chakra-ui/react'
import { BlockOptions } from '@quickbot.io/schemas'
import { ForgedCredentialsDropdown } from './credentials/ForgedCredentialsDropdown'
import { ForgedCredentialsModal } from './credentials/ForgedCredentialsModal'
import { ZodObjectLayout } from './zodLayouts/ZodObjectLayout'
import { ZodActionDiscriminatedUnion } from './zodLayouts/ZodActionDiscriminatedUnion'
import { useForgedBlock } from '../hooks/useForgedBlock'
import { ForgedBlock } from '@quickbot.io/forge-repository/types'
import { useState, useEffect, useCallback } from 'react'

type Props = {
  block: ForgedBlock
  onOptionsChange: (options: BlockOptions) => void
}
export const ForgedBlockSettings = ({ block, onOptionsChange }: Props) => {
  const [keySuffix, setKeySuffix] = useState<number>(0)
  const { blockDef, blockSchema, actionDef, actionDefaults } = useForgedBlock(
    block.type,
    block.options?.action,
  )
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Helper: Automatically apply default values to block options
  const applyDefaultValues = useCallback(() => {
    if (!actionDefaults || Object.keys(actionDefaults).length === 0) return

    const currentOptions = block.options || {}
    const updatedOptions = { ...currentOptions }
    let hasChanges = false

    Object.entries(actionDefaults).forEach(([key, defaultValue]) => {
      if (currentOptions[key] === undefined && defaultValue !== undefined) {
        updatedOptions[key] = defaultValue
        hasChanges = true
      }
    })

    if (hasChanges) {
      onOptionsChange(updatedOptions)
    }
  }, [actionDefaults, block.options, onOptionsChange])

  // Apply defaults when options or action changes
  useEffect(() => {
    applyDefaultValues()
  }, [applyDefaultValues])

  // Update credentials ID in block options
  const updateCredentialsId = (credentialsId?: string) => {
    onOptionsChange({
      ...block.options,
      credentialsId,
    })
  }

  // Helper: Create options for new action with defaults and preserved values
  const createActionOptions = useCallback(() => {
    if (!actionDef) return {}

    const actionOptions = { ...actionDefaults }
    const actionKeys = Object.keys(actionDef.options?.shape ?? [])

    // Preserve existing simple values (not objects)
    actionKeys.forEach((key) => {
      const currentValue = block.options[key]
      if (currentValue && typeof currentValue !== 'object') {
        actionOptions[key] = currentValue
      }
    })

    return actionOptions
  }, [actionDef, actionDefaults, block.options])

  // Reset options when action changes, applying defaults and preserved values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resetOptionsAction = (updates: any) => {
    if (!actionDef) return

    const actionOptions = createActionOptions()
    onOptionsChange({ ...updates, ...actionOptions })
    setKeySuffix((prev) => prev + 1)
  }

  // Update block options, handling action changes specially
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateOptions = (updates: any) => {
    const isChangingAction = actionDef && updates?.action && updates.action !== block.options.action
    if (isChangingAction) {
      resetOptionsAction(updates)
      return
    }
    onOptionsChange(updates)
  }

  if (!blockDef || !blockSchema) return null
  return (
    <Stack spacing={4}>
      {blockDef.auth && (
        <>
          <ForgedCredentialsModal
            mode="create"
            blockDef={blockDef}
            isOpen={isOpen}
            onClose={onClose}
            onNewCredentials={updateCredentialsId}
          />
          <ForgedCredentialsDropdown
            key={block.options?.credentialsId ?? 'none'}
            blockDef={blockDef}
            currentCredentialsId={block.options?.credentialsId}
            onCredentialsSelect={updateCredentialsId}
            onAddClick={onOpen}
          />
        </>
      )}
      {(block.options !== undefined || blockDef.auth === undefined) && (
        <>
          {blockDef.options && (
            <ZodObjectLayout
              schema={blockDef.options}
              data={block.options}
              blockOptions={block.options}
              blockDef={blockDef}
              onDataChange={onOptionsChange}
            />
          )}
          <ZodActionDiscriminatedUnion
            key={block.id + keySuffix}
            schema={blockSchema.shape.options}
            blockDef={blockDef}
            blockOptions={block.options}
            onDataChange={updateOptions}
          />
        </>
      )}
    </Stack>
  )
}
