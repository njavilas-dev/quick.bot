import { Flex, Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { VariableTag } from './VariableTag'

type Props = {
  variableName: string
  bgColor?: string
}

export const SetVariableTag = ({ variableName, bgColor}: Props) => {
  const { t } = useTranslate()

  return (
    <Flex align="center" gap={1} alignItems="center">
      <Text fontStyle="italic" fontSize="sm" color="text.light">
        {t('variables.set')}
      </Text>
      <VariableTag variableName={variableName} bgColor={bgColor}/>
    </Flex>
  )
}
