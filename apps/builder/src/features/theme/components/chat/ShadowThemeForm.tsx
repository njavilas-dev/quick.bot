import React from 'react'
import { ButtonGroup } from '@chakra-ui/react'
import { Button } from '@urbiport/ui'
import { ProhibitedIcon } from '@urbiport/icons'

type Shadow = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | undefined

type ShadowThemeFormProps = {
  currentItem: string
  onItemSelect: (value: Shadow) => void
}

type ShadowValue = {
  label: string
  value: Shadow
}

const ShadowThemeForm = ({ currentItem, onItemSelect }: ShadowThemeFormProps) => {
  const shadowValues: ShadowValue[] = [
    { label: 'None', value: 'none' },
    { label: 'S', value: 'sm' },
    { label: 'M', value: 'md' },
    { label: 'L', value: 'lg' },
    { label: 'XL', value: 'xl' },
    { label: '2XL', value: '2xl' },
  ]

  const handleShadowChange = (value: Shadow) => {
    onItemSelect(value)
  }

  const control = {
    w: '100%',
    border: '1px solid',
    borderColor: 'gray.200',
    p: '4px',
    borderRadius: 'md',
    spacing: '4px',
  }

  return (
    <ButtonGroup {...control}>
      {shadowValues.map((shadow) => {
        const isActive = shadow.value === currentItem
        return (
          <Button
            w={'100%'}
            h={'28px'}
            key={shadow.value}
            backgroundColor={isActive ? 'black' : 'transparent'}
            color={isActive ? 'white' : 'black'}
            variant="ghost"
            _hover={{ bg: 'gray.100' }}
            onClick={() => handleShadowChange(shadow.value)}
          >
            {shadow.label === 'None' ? <ProhibitedIcon /> : shadow.label}
          </Button>
        )
      })}
    </ButtonGroup>
  )
}

export default ShadowThemeForm
