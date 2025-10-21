import { useState } from 'react'
import { BlockV6 } from '@quickbot.io/schemas'

export interface BlockTemplateConfirmationState {
  isOpen: boolean
  blockType: BlockV6['type'] | null
  groupIndex: number | null
  blockIndex: number | null
  onConfirm: ((templateId?: string) => void) | null
  onCreateBasic: (() => void) | null
  onCancel: (() => void) | null
}

export const useBlockTemplateConfirmation = () => {
  const [confirmationState, setConfirmationState] = useState<BlockTemplateConfirmationState>({
    isOpen: false,
    blockType: null,
    groupIndex: null,
    blockIndex: null,
    onConfirm: null,
    onCreateBasic: null,
    onCancel: null,
  })

  const showTemplateConfirmation = (
    blockType: BlockV6['type'],
    groupIndex: number,
    blockIndex: number,
    onConfirm: (templateId?: string) => void,
    onCreateBasic: () => void,
    onCancel: () => void,
  ) => {
    setConfirmationState({
      isOpen: true,
      blockType,
      groupIndex,
      blockIndex,
      onConfirm,
      onCreateBasic,
      onCancel,
    })
  }

  const hideTemplateConfirmation = () => {
    setConfirmationState({
      isOpen: false,
      blockType: null,
      groupIndex: null,
      blockIndex: null,
      onConfirm: null,
      onCreateBasic: null,
      onCancel: null,
    })
  }

  const handleConfirm = (templateId?: string) => {
    if (confirmationState.onConfirm) {
      confirmationState.onConfirm(templateId)
    }
    hideTemplateConfirmation()
  }

  const handleCancel = () => {
    if (confirmationState.onCancel) {
      confirmationState.onCancel()
    }
    hideTemplateConfirmation()
  }

  const handleCreateBasic = () => {
    if (confirmationState.onCreateBasic) {
      confirmationState.onCreateBasic()
    }
    hideTemplateConfirmation()
  }

  return {
    confirmationState,
    showTemplateConfirmation,
    hideTemplateConfirmation,
    handleConfirm,
    handleCancel,
    handleCreateBasic,
  }
}
