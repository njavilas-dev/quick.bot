import { TextLink } from '@/components/TextLink'
import { useUser } from '@/hooks/useUser'
import { useWorkspace } from '@/hooks/useWorkspace'
import { HStack, Text } from '@chakra-ui/react'
import { BillingPlanType } from '@quickbot.io/prisma'

type Props = {
  botId: string
}
export const SuspectedBotBanner = ({ botId }: Props) => {
  const { user } = useUser()
  const { workspace } = useWorkspace()

  if (!user?.email || !workspace) return null

  return (
    <HStack
      bgColor="alert.error.bg"
      w="full"
      zIndex={1000}
      color="alert.error.color"
      justifyContent="center"
      fontSize="sm"
      textAlign="center"
      py="2"
    >
      <Text fontWeight="bold">
        Our anti-scam system flagged your bot. It is currently being reviewed manually.
        {workspace?.billingPlan.key !== BillingPlanType.FREE ? (
          <>
            <br />
            If you think that&apos;s a mistake,{' '}
            <TextLink
              href={`https://bot.co/claim-non-scam?Email=${encodeURIComponent(
                user.email,
              )}&botId=${botId}`}
            >
              contact us
            </TextLink>
            .
          </>
        ) : null}
      </Text>
    </HStack>
  )
}
