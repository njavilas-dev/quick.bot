import { Box, BoxProps, Flex, Text, VStack } from '@chakra-ui/react'
import { BotIcon } from '@/components/BotIcon'
import { BotInDashboard } from '@/features/bot/types'

type Props = {
  bot: BotInDashboard
} & BoxProps

export const BotCardOverlay = ({ bot, ...props }: Props) => {
  return (
    <Box
      display="flex"
      flexDir="column"
      variant="outline"
      justifyContent="center"
      w="225px"
      h="270px"
      whiteSpace="normal"
      transition="none"
      pointerEvents="none"
      borderWidth={1}
      borderRadius="md"
      bgColor="bg.dark"
      shadow="lg"
      opacity={0.7}
      {...props}
    >
      <VStack spacing={4}>
        <Flex borderRadius="full" justifyContent="center" alignItems="center" fontSize={'4xl'}>
          <BotIcon icon={bot.icon} size="lg" />
        </Flex>
        <Text>{bot.name}</Text>
      </VStack>
    </Box>
  )
}
