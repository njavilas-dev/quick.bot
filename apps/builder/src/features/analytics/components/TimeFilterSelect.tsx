import { Button, MenuItem, HStack, Text } from '@chakra-ui/react'
import { ChevronDownIcon } from '@urbiport/icons'
import { DropdownMenu, MoreInfoTooltip } from '@urbiport/ui'
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
      {showLabel && (
        <HStack spacing={1}>
          <Text>{t('dashboard.label.filterFor')}</Text>
          <MoreInfoTooltip>
            Select the time period for viewing analytics data (today, last 7 days, 30 days, 90 days, or all time)
          </MoreInfoTooltip>
        </HStack>
      )}
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
