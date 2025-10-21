import React, { useMemo, useState } from 'react'
import {
  MenuItem,
  MenuDivider,
  Text,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Box,
  InputGroup,
  InputRightElement,
  IconButton,
  VStack,
  Tooltip,
} from '@chakra-ui/react'
import {
  PlusIcon,
  CloseIcon,
  CheckIcon,
  EditIcon,
  TrashIcon,
  SearchIcon,
  ToolIcon,
  VariableIcon,
} from '@urbiport/icons'
import { Variable } from '@quickbot.io/schemas'
import { useBot } from '@/features/editor/providers/BotProvider'
import { useTranslate } from '@tolgee/react'
import { FormControl, InputText, Switch, useToast } from '@urbiport/ui'
import { createId } from '@quickbot.io/lib/createId'
import {
  analyzeVariableUsage,
  UNUSED_VARIABLE_OPACITY,
  USED_VARIABLE_OPACITY,
} from '@/lib/variables/variableUsage'
import { systemVariables } from '@quickbot.io/variables/system-variables'

type VariablesListProps = {
  initialVariableId?: string
  placeholder?: string
  withClear?: boolean
  onSelect?: (variable: Pick<Variable, 'id' | 'name'> | undefined) => void
  modalRef?: React.RefObject<HTMLDivElement>
  onModalStateChange?: (isOpen: boolean) => void
}

export const VariablesList: React.FC<VariablesListProps> = ({
  initialVariableId,
  onSelect,
  withClear = false,
  modalRef,
  onModalStateChange,
}: VariablesListProps) => {
  const { t } = useTranslate()
  const { bot, createVariable, deleteVariable, updateVariable } = useBot()

  // Merge system variables with bot variables, prioritizing bot variables if they have the same id
  const mergedSystemVariables = systemVariables.map(sysVar => {
    const botVar = bot?.variables.find(v => v.id === sysVar.id)
    return botVar || sysVar
  })

  const variables = bot?.variables
    ? [...bot.variables.filter(v => !systemVariables.find(sv => sv.id === v.id)), ...mergedSystemVariables]
    : [...mergedSystemVariables]
  const [searchValue, setSearchValue] = useState('')
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null)
  const [updatedVariable, setUpdatedVariable] = useState<Partial<Variable>>({})
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()
  const {
    isOpen: isDeleteConfirmModalOpen,
    onOpen: onDeleteConfirmModalOpen,
    onClose: onDeleteConfirmModalClose,
  } = useDisclosure()
  const [variableToDelete, setVariableToDelete] = useState<Variable | null>(null)
  const { showToast } = useToast()

  const { usedVariableIds, variableUsageMap } = useMemo(
    () =>
      bot ? analyzeVariableUsage(bot) : { usedVariableIds: new Set(), variableUsageMap: new Map() },
    [bot],
  )

  const selectedVariable = initialVariableId
    ? variables.find((v: Variable) => v.id === initialVariableId)
    : undefined

  const filteredVariables = variables.filter((variable: Variable) =>
    variable.name.toLowerCase().includes(searchValue.toLowerCase()),
  )

  const handleOnSearch = (value: string) => {
    setSearchValue(value)
  }

  const handleOnClearSearch = (e: React.MouseEvent) => {
    e.preventDefault()
    setSearchValue('')
  }

  const handleClearSelection = (e: React.MouseEvent) => {
    e.preventDefault()
    onSelect?.(undefined)
  }

  const handleCreateNew = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()

    setIsCreatingNew(true)
    setEditingVariable(null)
    setUpdatedVariable({
      name: '',
      isSavedVariable: false,
      isSecretVariable: false,
    })
    onModalOpen()
    onModalStateChange?.(true)
  }

  const handleOnEdit = (variable: Variable) => {
    setIsCreatingNew(false)
    setEditingVariable(variable)
    setUpdatedVariable(variable)
    onModalOpen()
    onModalStateChange?.(true)
  }

  const handleModalSubmit = () => {
    // For system variables, use the original name; for others, validate the trimmed name
    const nameToUse = editingVariable?.isSystemVariable ? editingVariable.name : updatedVariable?.name?.trim()
    if (!nameToUse) return

    const trimmedName = nameToUse.trim()

    // Check for duplicates
    const existingVariable = variables.find(
      (v: Variable) =>
        (!isCreatingNew ? v.id !== editingVariable?.id : true) &&
        v.name.trim().toLowerCase() === trimmedName.toLowerCase(),
    )

    if (existingVariable) {
      showToast({
        title: t('editor.sidebarBlocks.variables.duplicatedError.title'),
        description: t('editor.sidebarBlocks.variables.duplicatedError.message'),
        status: 'error',
      })
      return
    }

    if (isCreatingNew) {
      // Create new variable
      const id = `v${createId()}`
      const newVariable = {
        id,
        name: trimmedName,
        isSavedVariable: updatedVariable.isSecretVariable
          ? false
          : updatedVariable.isSavedVariable || false,
        isSecretVariable: updatedVariable.isSecretVariable || false,
      }
      createVariable(newVariable)

      // Auto-select the newly created variable
      onSelect?.(newVariable)

      showToast({
        title: t('variables.modal.success'),
        description: `Variable "${trimmedName}" created successfully`,
        status: 'success',
      })

      // Close modal after creating variable
      handleModalClose()
    } else if (editingVariable) {
      // Update existing variable
      const updates = editingVariable.isSystemVariable
        ? { ...updatedVariable, name: editingVariable.name } // Keep original name for system variables
        : { ...updatedVariable, name: trimmedName }

      // For system variables, we need to add them to bot.variables if not already there
      if (editingVariable.isSystemVariable) {
        const existsInBot = bot?.variables.find(v => v.id === editingVariable.id)
        if (!existsInBot) {
          // Create a new entry in bot.variables for this system variable
          createVariable({
            ...editingVariable,
            ...updates,
            isSystemVariable: true,
          })
        } else {
          // Update existing entry
          updateVariable(editingVariable.id, updates)
        }
      } else {
        updateVariable(editingVariable.id, updates)
      }

      showToast({
        title: t('variables.modal.success'),
        description: `Variable "${trimmedName}" updated successfully`,
        status: 'success',
      })

      // Close modal after updating variable
      handleModalClose()
    }
  }

  const handleModalClose = () => {
    setIsCreatingNew(false)
    setEditingVariable(null)
    setUpdatedVariable({})
    onModalClose()
    onModalStateChange?.(false)
  }

  const handleOnDelete = (variable: Variable) => {
    if (variable.isSystemVariable) return
    const usages = variableUsageMap.get(variable.id)
    if (usages && usages.length > 0) {
      setVariableToDelete(variable)
      onDeleteConfirmModalOpen()
    } else {
      deleteVariable(variable.id)
      if (variable.name === searchValue) {
        setSearchValue('')
        onSelect?.(undefined)
      }
    }
  }

  const confirmDelete = () => {
    if (!variableToDelete) return
    deleteVariable(variableToDelete.id)
    if (variableToDelete.name === searchValue) {
      setSearchValue('')
      onSelect?.(undefined)
    }
    onDeleteConfirmModalClose()
    setVariableToDelete(null)
  }

  return (
    <Box w={'100%'}>
      <HStack spacing={2} mb={3}>
        <InputGroup flex={1}>
          <InputText
            value={searchValue}
            onChange={handleOnSearch}
            placeholder={t('variables.dropdown.placeholder')}
            aria-label={t('variables.dropdown.ariaLabel')}
            leftIcon={<SearchIcon color="text.light" />}
            rightIcon={
              <>
                {searchValue && (
                  <IconButton
                    aria-label={t('variables.dropdown.clearSearch')}
                    icon={<CloseIcon />}
                    size="xs"
                    variant="ghost"
                    onClick={handleOnClearSearch}
                  />
                )}
              </>
            }
          />
          {selectedVariable && withClear && (
            <InputRightElement>
              <IconButton
                onClick={handleClearSelection}
                icon={<CloseIcon />}
                aria-label="Clear"
                size="sm"
                variant="ghost"
                pointerEvents="all"
              />
            </InputRightElement>
          )}
        </InputGroup>
        <IconButton
          variant="outline"
          aria-label={t('variables.dropdown.addVariable')}
          title={t('variables.dropdown.addVariable')}
          icon={<PlusIcon />}
          onClick={handleCreateNew}
          flexShrink={0}
        />
      </HStack>
      <MenuDivider />
      {filteredVariables.map((variable) => {
        const tooltipLabel = `${variable.isSystemVariable ? 'System variable' : 'Variable'}${variable.isSecretVariable ? ' / Secret' : ''
          }. Save in results: ${variable.isSavedVariable ? 'Yes' : 'No'}.`

        return (
          <Tooltip key={variable.id} label={tooltipLabel} placement="top">
            <MenuItem
              onClick={() => onSelect?.(variable)}
              _hover={{ bg: 'gray.50' }}
              _selected={{ bg: 'gray.50' }}
              aria-selected={selectedVariable?.id === variable.id ? 'true' : 'false'}
            >
              <HStack width="100%" spacing={1}>
                {variable.isSystemVariable ? (
                  <ToolIcon />
                ) : (
                  <VariableIcon
                    opacity={
                      usedVariableIds.has(variable.id) || variable.isSystemVariable
                        ? USED_VARIABLE_OPACITY
                        : UNUSED_VARIABLE_OPACITY
                    }
                  />
                )}
                <Text
                  flex="1"
                  isTruncated
                  minWidth="0"
                  opacity={
                    usedVariableIds.has(variable.id) || variable.isSystemVariable
                      ? USED_VARIABLE_OPACITY
                      : UNUSED_VARIABLE_OPACITY
                  }
                >
                  {variable.name}
                </Text>
                {selectedVariable?.id === variable.id && (
                  <IconButton
                    as="span"
                    size="xs"
                    variant="ghost"
                    aria-label="Selected variable"
                    icon={<CheckIcon color="text.light" w={4} h={4} />}
                    flexShrink={0}
                    pointerEvents="none"
                    cursor="default"
                  />
                )}
                <IconButton
                  as="span"
                  size="xs"
                  variant="ghost"
                  aria-label="Edit variable"
                  icon={<EditIcon color="text.light" w={4} h={4} />}
                  flexShrink={0}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleOnEdit(variable)
                  }}
                />
                <IconButton
                  as="span"
                  size="xs"
                  variant="ghost"
                  aria-label="Delete variable"
                  icon={<TrashIcon color="text.light" w={4} h={4} />}
                  flexShrink={0}
                  isDisabled={variable.isSystemVariable}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleOnDelete(variable)
                  }}
                />
              </HStack>
            </MenuItem>
          </Tooltip>
        )
      })}

      <Modal isOpen={isModalOpen} onClose={handleModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isCreatingNew
              ? t('variables.modal.createVariable')
              : t('variables.modal.editVariable')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody ref={modalRef}>
            <InputText
              value={updatedVariable.name || ''}
              onChange={(name) => setUpdatedVariable({ ...updatedVariable, name })}
              placeholder={t('variables.modal.variableNamePlaceholder')}
              mb={4}
              autoFocus={isCreatingNew}
              isDisabled={updatedVariable?.isSystemVariable} // Disable name for system variables
            />
            <FormControl
              aria-label={'Secret variable'}
              direction="row"
              label={t('variables.modal.saveInResults.label')}
              moreInfoTooltip={t('variables.modal.saveInResults.tooltip')}
            >
              <Switch
                key={`isSavedVariable-${updatedVariable.isSavedVariable}`}
                isDisabled={updatedVariable?.isSecretVariable}
                defaultValue={updatedVariable.isSavedVariable || false}
                onChange={(isSavedVariable) =>
                  setUpdatedVariable({
                    ...updatedVariable,
                    isSavedVariable,
                  })
                }
              />
            </FormControl>
            <FormControl
              mt={'5'}
              direction="row"
              label={t('variables.modal.secretVariable.label')}
              moreInfoTooltip={t('variables.modal.secretVariable.tooltip')}
            >
              <Switch
                key={`isSecretVariable-${updatedVariable.isSecretVariable}`}
                defaultValue={updatedVariable.isSecretVariable || false}
                onChange={(isSecretVariable) => {
                  setUpdatedVariable({
                    ...updatedVariable,
                    isSecretVariable,
                    isSavedVariable: isSecretVariable ? false : updatedVariable.isSavedVariable,
                  })
                }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={handleModalClose} mr={3}>
              {t('variables.modal.cancel')}
            </Button>
            <Button
              colorScheme={isCreatingNew ? 'green' : 'blue'}
              onClick={handleModalSubmit}
              isDisabled={
                isCreatingNew 
                  ? !updatedVariable?.name?.trim()
                  : editingVariable?.isSystemVariable 
                    ? false 
                    : !updatedVariable?.name?.trim()
              }
            >
              {isCreatingNew ? t('variables.modal.createVariable') : t('variables.modal.save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteConfirmModalOpen} onClose={onDeleteConfirmModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} alignItems={'flex-start'}>
              <Text>
                The variable <strong>{variableToDelete?.name}</strong> is used in current flow. Are
                you sure you want to delete it?
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onDeleteConfirmModalClose} mr={3}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}