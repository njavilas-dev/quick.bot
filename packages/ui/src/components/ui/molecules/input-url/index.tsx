import React, { ForwardedRef, useEffect, useState } from 'react'
import { IconButton, HStack } from '@chakra-ui/react'
import { CheckIcon, EditIcon } from '@urbiport/icons'
import { IReactElement } from '../../../../shared/interfaces'
import { InputTextCopy } from '../input-text-copy'

interface ShareInputProps {
  baseURL: string
  pathURL: string
  onSave: (value: string) => void
  onCopy: (value: string) => void
}

const checkIfPathnameIsValid = (pathname: string) => {
  const isCorrectlyFormatted =
    /^([a-z0-9]+-[a-z0-9]*)*$/.test(pathname) || /^[a-z0-9]*$/.test(pathname)

  if (!isCorrectlyFormatted) {
    return false
  }
  return true
}

export const InputURL = React.forwardRef(
  (props: ShareInputProps, ref: ForwardedRef<HTMLDivElement>): IReactElement => {
    const { baseURL, pathURL, onSave } = props

    const [isValidPathname, setIsValidPathname] = useState<boolean>(true)
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [pathname, setPathname] = useState<string>(pathURL)

    useEffect(() => {
      setPathname(pathURL)
    }, [pathURL])

    const handleChange = (value: string): void => {
      const isValidValue = checkIfPathnameIsValid(value)
      setIsValidPathname(isValidValue)
      setPathname(value)
    }

    const handleEdit = (): void => {
      setIsEditing(true)
    }

    const handleSave = (): void => {
      if (pathname === pathURL) {
        setIsEditing(false)
        return
      }

      if (!pathname.trim()) {
        setIsValidPathname(false)
        return
      }

      if (!checkIfPathnameIsValid(pathname)) {
        setIsValidPathname(false)
        return
      }
      onSave(pathname)
      setIsEditing(false)
    }

    return (
      <HStack ref={ref}>
        <InputTextCopy
          data-testid={'url-input'}
          defaultValue={isEditing ? pathname : `${baseURL}/${pathname}`}
          isInvalid={!isValidPathname}
          readOnly={!isEditing}
          onChange={handleChange}
          pattern="^([a-z0-9]+-[a-z0-9]*)*$"
        />
        {isEditing ? (
          <IconButton
            data-testid={'save-button'}
            icon={<CheckIcon />}
            aria-label="Save"
            onClick={handleSave}
            variant="outline"
          />
        ) : (
          <IconButton
            data-testid={'edit-button'}
            icon={<EditIcon />}
            aria-label="Edit"
            onClick={handleEdit}
            variant="outline"
          />
        )}
      </HStack>
    )
  },
)

InputURL.displayName = 'InputURL'
