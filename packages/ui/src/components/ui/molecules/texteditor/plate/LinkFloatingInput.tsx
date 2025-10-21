import React, { useRef } from 'react'
import { flip, offset, UseVirtualFloatingOptions } from '@udecode/plate-floating'
import {
  LinkFloatingToolbarState,
  useFloatingLinkEdit,
  useFloatingLinkEditState,
  useFloatingLinkInsert,
  useFloatingLinkInsertState,
  useFloatingLinkUrlInput,
} from '@udecode/plate-link'
import { LinkIcon, TextIcon, UnlinkIcon } from '@urbiport/icons'
import {
  Button,
  Divider,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
} from '@chakra-ui/react'

const floatingOptions: UseVirtualFloatingOptions = {
  placement: 'bottom-start',
  middleware: [
    offset(12),
    flip({
      padding: 12,
      fallbackPlacements: ['bottom-end', 'top-start', 'top-end'],
    }),
  ],
}

interface LinkFloatingToolbarProps {
  state?: LinkFloatingToolbarState
}

export function LinkFloatingToolbar({ state }: LinkFloatingToolbarProps) {
  const urlInputRef = useRef<HTMLInputElement>(null)
  const insertState = useFloatingLinkInsertState({
    ...state,
    floatingOptions: {
      ...floatingOptions,
      ...state?.floatingOptions,
    },
  })
  const {
    props: insertProps,
    ref: insertRef,
    hidden,
    textInputProps,
  } = useFloatingLinkInsert(insertState)

  const { props } = useFloatingLinkUrlInput({
    ref: urlInputRef,
  })

  const editState = useFloatingLinkEditState({
    ...state,
    floatingOptions: {
      ...floatingOptions,
      ...state?.floatingOptions,
    },
  })
  const {
    props: editProps,
    ref: editRef,
    editButtonProps,
    unlinkButtonProps,
  } = useFloatingLinkEdit(editState)

  if (hidden) return null

  const input = (
    <Stack bgColor="bg.normal" p="4" rounded="md" borderWidth={1} shadow="md" w="330px">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <LinkIcon />
        </InputLeftElement>
        <Input
          ref={urlInputRef}
          placeholder="Paste link"
          defaultValue={props.defaultValue}
          onChange={props.onChange}
        />
      </InputGroup>

      <Divider />

      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <TextIcon />
        </InputLeftElement>
        <Input placeholder="Text to display" {...textInputProps} />
      </InputGroup>
    </Stack>
  )

  const editContent = editState.isEditing ? (
    input
  ) : (
    <HStack bgColor="bg.normal" p="4" rounded="md" borderWidth={1} shadow="md" align="center">
      <Button {...editButtonProps} size="sm">
        Edit link
      </Button>
      <Divider orientation="vertical" h="20px" />
      <IconButton icon={<UnlinkIcon />} aria-label="Unlink" size="sm" {...unlinkButtonProps} />
    </HStack>
  )

  return (
    <>
      <div ref={insertRef} {...insertProps}>
        {input}
      </div>

      <div ref={editRef} {...editProps}>
        {editContent}
      </div>
    </>
  )
}
