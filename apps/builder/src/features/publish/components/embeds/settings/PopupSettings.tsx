import { InputNumberWithVariables } from '@/components/inputs'
import { StackProps, Stack } from '@chakra-ui/react'
import { PopupProps } from '@urbiport/nextjs'
import { useState, useEffect } from 'react'
import { isDefined } from '@quickbot.io/lib'
import { useTranslate } from '@tolgee/react'
import { Switch, FormControl } from '@urbiport/ui'

type Props = {
  onUpdateSettings: (windowSettings: Pick<PopupProps, 'autoShowDelay'>) => void
} & StackProps

export const PopupSettings = ({ onUpdateSettings, ...props }: Props) => {
  const { t } = useTranslate()
  const [isEnabled, setIsEnabled] = useState(false)
  const [inputValue, setInputValue] = useState(5)

  useEffect(() => {
    onUpdateSettings({
      autoShowDelay: isEnabled ? inputValue * 1000 : undefined,
    })
  }, [inputValue, isEnabled, onUpdateSettings])

  const handleDelayChange = (val?: number) => isDefined(val) && setInputValue(val)

  return (
    <Stack {...props} spacing={4}>
      <FormControl direction="row" label={t('publish.popup.settings.autoShow.switchLabel')}>
        <Switch defaultValue={isEnabled} onChange={setIsEnabled} />
      </FormControl>
      {isEnabled && (
        <FormControl label={t('publish.popup.settings.autoShow.after')}>
          <InputNumberWithVariables
            suffix={t('publish.popup.settings.autoShow.seconds')}
            size="sm"
            w="70px"
            defaultValue={inputValue}
            onChange={handleDelayChange}
          />
        </FormControl>
      )}
    </Stack>
  )
}
