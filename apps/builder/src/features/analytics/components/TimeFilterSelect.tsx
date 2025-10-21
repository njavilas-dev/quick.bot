import { Button, MenuItem, HStack, Text } from '@chakra-ui/react'
import { ChevronDownIcon } from '@urbiport/icons'
import { DropdownMenu } from '@urbiport/ui'
import { useTranslate } from '@tolgee/react'
import { timeFilterValues, timeFilterLabels } from '../constants'

interface TimeFilterSelectProps {
  value: (typeof timeFilterValues)[number]
  onChange: (value: (typeof timeFilterValues)[number]) => void
  showLabel?: boolean
}

export const TimeFilterSelect = ({
  value,
  onChange,
  showLabel = true
}: TimeFilterSelectProps) => {
  const { t } = useTranslate()

  return (
    <HStack justify="space-between">
      {showLabel && <Text>{t('dashboard.label.filterFor')}</Text>}
      <DropdownMenu
        placement="bottom-start"
        matchWidth={false}
        menuButton={timeFilterLabels[value]}
        menuButtonProps={{
          as: Button,
          size: 'sm',
          rightIcon: <ChevronDownIcon />,
        }}
      >
        {(Object.keys(timeFilterLabels) as Array<typeof value>).map((key) => (
          <MenuItem
            key={key}
            onClick={() => onChange(key)}
            whiteSpace="nowrap"
          >
            {timeFilterLabels[key]}
          </MenuItem>
        ))}
      </DropdownMenu>
    </HStack>
  )
}
