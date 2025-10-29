import React from 'react'
import { Box, Button, List, ListItem, ListIcon, Stack, Text, VStack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { BillingPlanType } from '@quickbot.io/prisma'
import { IconComponentType, CheckCircleIcon } from '@urbiport/icons'
import { PlanPricingCardChatTeers } from './PlanPricingCardChatTeers'
import { usePlanPricing } from '../helpers/usePlanPricing'
import { CheckIcon, CloseIcon } from '@urbiport/icons/src'
import { Plan, PlanWithoutChatTiers } from '@quickbot.io/schemas'

type Props = {
  isLoading: boolean
  isCurrent: boolean
  isPopular: boolean
  isDowngrade: boolean
  onPurchase: (plan: BillingPlanType) => void
  planInformation: Plan | PlanWithoutChatTiers
  planIcon: IconComponentType
  planDesc: string
  planDetail: string
}

export const PlanPricingCard = ({
  isLoading,
  isCurrent,
  isPopular,
  isDowngrade,
  onPurchase,
  planInformation,
  planIcon: PlanIcon,
  planDesc,
  planDetail,
}: Props) => {
  const { t } = useTranslate()
  const { label } = usePlanPricing(isCurrent, isDowngrade, isPopular)

  return (
    <Box
      zIndex={'1'}
      width="350px"
      height="100%"
      bg={'bg.normal'}
      borderRadius="lg"
      border={isPopular ? '2px solid' : 'none'}
      borderColor={'green.500'}
      boxShadow={'0px 2px 12px 0px rgba(20, 43, 31, 0.08)'}
      p={8}
      position="relative"
      overflow="hidden"
    >
      {isPopular && (
        <Box
          position="absolute"
          top="40px"
          right="-40px"
          transform="rotate(45deg)"
          bg="brand.premium"
          color="white"
          fontSize="xs"
          fontWeight="bold"
          px="10"
          py="1"
          boxShadow="md"
          zIndex={2}
          textTransform="uppercase"
          letterSpacing="wide"
          aria-label={t('billing.pricingCard.business.mostPopularLabel')}
        >
          {t('billing.pricingCard.business.mostPopularLabel')}
        </Box>
      )}
      <Box>
        <Stack direction="row" spacing={4} mb={2} alignItems="center">
          <VStack
            spacing={1}
            p={4}
            bg="green.100"
            borderRadius="md"
            w={'60px'}
            h={'60px'}
            alignItems="center"
            justifyContent="center"
          >
            <PlanIcon size="2xl" color="brand.primary" />
          </VStack>
          <Text
            fontSize="2xl"
            fontWeight='semibold'
            color={'text.normal'}
          >
            {planInformation?.name}
          </Text>
        </Stack>
        <Box minH="140px">
          <Text fontSize="md" color={'text.light'} my={4} fontWeight="bold">
            {planDesc}
          </Text>
          <Text fontSize="md" color={'text.light'} my={4}>
            {planDetail}
          </Text>
        </Box>
        <Text mb={4} fontSize="5xl" fontWeight="medium" color={'text.normal'}>
          ${planInformation?.price}
          <Text as="span" fontSize="xl" fontWeight="medium" color={'text.light'}>
            /{t('billing.monthly.label')}
          </Text>
        </Text>
        <List spacing={2} my={6} color={'text.dark'} minH="120px">
          <ListItem>
            <ListIcon as={CheckCircleIcon} />
            {t('billing.pricingCard.includedSeats', { seats: planInformation?.membersLimit })}
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} />
            {planInformation?.botsLimit} {t('billing.pricingCard.allowedBots')}
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} />
            {planInformation?.chatsLimit} {t('billing.pricingCard.chatsPerMonth')}
          </ListItem>
          {'chatTiers' in planInformation && planInformation.chatTiers.length > 0 && (
            <ListItem>
              <ListIcon as={CheckCircleIcon} />
              <PlanPricingCardChatTeers
                planChatTiers={'chatTiers' in planInformation ? planInformation.chatTiers : []}
              />
            </ListItem>
          )}
        </List>
        <Button
          disabled={isCurrent}
          isLoading={isLoading}
          onClick={(e) => {
            e.preventDefault()
            onPurchase(planInformation?.key)
          }}
          width="100%"
          aria-label={planInformation?.key}
        >
          {label}
        </Button>
        <List spacing={2} my={6} color={'text.dark'}>
          <ListItem>
            <ListIcon
              as={planInformation?.allowGuests ? CheckIcon : CloseIcon}
              color={planInformation?.allowGuests ? 'green' : 'red'}
            />
            {t('billing.pricingCard.feature.invite')}
          </ListItem>
          <ListItem>
            <ListIcon
              as={planInformation?.allowRemoveBrand ? CheckIcon : CloseIcon}
              color={planInformation?.allowRemoveBrand ? 'green' : 'red'}
            />
            {t('billing.pricingCard.feature.branding')}
          </ListItem>
          <ListItem>
            <ListIcon
              as={planInformation?.allowAnalytics ? CheckIcon : CloseIcon}
              color={planInformation?.allowAnalytics ? 'green' : 'red'}
            />
            {t('billing.pricingCard.feature.analytics')}
          </ListItem>
          <ListItem>
            <ListIcon
              as={planInformation?.allowResults ? CheckIcon : CloseIcon}
              color={planInformation?.allowResults ? 'green' : 'red'}
            />
            {t('billing.pricingCard.feature.results')}
          </ListItem>
          <ListItem>
            <ListIcon
              as={planInformation?.allowWhatsapp ? CheckIcon : CloseIcon}
              color={planInformation?.allowWhatsapp ? 'green' : 'red'}
            />
            {t('billing.pricingCard.feature.whatsapp')}
          </ListItem>
        </List>
      </Box>
    </Box >
  )
}

//FIXME: See tiers no funciona
