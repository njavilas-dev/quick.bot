import { chakra } from '@chakra-ui/react'

type Props = {
  variableName: string
  bgColor?: string
  color?: string
}

export const VariableTag = ({ variableName, bgColor = "purple.200", color = "purple.600" }: Props) => {
  return (
    <chakra.span
      display="inline-flex"
      alignItems="center"
      fontWeight="semibold"
      fontSize="10px"
      bgColor={bgColor}
      color={color}
      borderRadius="50px"
      py="0.5"
      px="3"
      margin="auto 0"
      verticalAlign="middle"
    >
      {variableName}
    </chakra.span>
  )
}
