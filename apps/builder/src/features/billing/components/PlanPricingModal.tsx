import { trpc } from '@/lib/trpc'
import React, { useRef } from 'react'
import {
  Box,
  Stack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure,
  Spinner,
  ModalCloseButton,
} from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { BillingPlanType } from '@quickbot.io/prisma'
import { BagIcon, BuildingIcon, IconComponentType, UserIcon } from '@urbiport/icons'
import { useSubscription } from '@/hooks/useSubscription'
import { useWorkspace } from '@/hooks/useWorkspace'
import { PlanPricingCard } from './PlanPricingCard'
import { PlanPricingCheckoutModal } from './PlanPricingCheckoutModal'
import { getDowngradeStatus } from '../helpers/getDowngradeStatus'

export type PlanPricingModalProps = {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  excludedPlans?: BillingPlanType[]
}

export const PlanPricingModal = ({
  isOpen,
  onClose,
  excludedPlans,
}: PlanPricingModalProps) => {
  const { t } = useTranslate()
  const { workspace } = useWorkspace()

  const { handlePurchaseSubscription, isLoading } = useSubscription(workspace, isOpen)

  const {
    isOpen: isOpenCheckoutModal,
    onOpen: onOpenCheckoutModal,
    onClose: onCloseCheckoutModal,
  } = useDisclosure()

  const checkoutPlanTypeRef = useRef<BillingPlanType | undefined>()

  const handleCheckoutPlanType = () => {
    if (checkoutPlanTypeRef.current) {
      handlePurchaseSubscription(checkoutPlanTypeRef.current)
    }
  }

  const handlePurchasePlanType = (planType: BillingPlanType) => {
    if (!workspace?.billingCompany || !workspace?.billingEmail) {
      checkoutPlanTypeRef.current = planType
      onOpenCheckoutModal()
      return
    }
    handlePurchaseSubscription(planType)
  }

  const currentPlan: BillingPlanType = workspace?.billingPlan.key ?? BillingPlanType.FREE

  const planConfig: Partial<
    Record<
      BillingPlanType,
      {
        icon: IconComponentType
        isPopular: boolean
        description: string
        detail: string
      }
    >
  > = {
    [BillingPlanType.FREE]: {
      icon: UserIcon,
      isPopular: false,
      description: t('billing.pricingCard.free.description'),
      detail: t('billing.pricingCard.free.detail'),
    },
    [BillingPlanType.PERSONAL]: {
      icon: UserIcon,
      isPopular: false,
      description: t('billing.pricingCard.personal.description'),
      detail: t('billing.pricingCard.personal.detail'),
    },
    [BillingPlanType.BUSINESS]: {
      icon: BuildingIcon,
      isPopular: true,
      description: t('billing.pricingCard.business.description'),
      detail: t('billing.pricingCard.business.detail'),
    },
    [BillingPlanType.ENTERPRISE]: {
      icon: BagIcon,
      isPopular: false,
      description: t('billing.pricingCard.enterprise.description'),
      detail: t('billing.pricingCard.enterprise.detail'),
    },
  }

  const { data: plansFromDatabase } = trpc.billing.listPlans.useQuery(
    { chatTiers: true },
    {
      enabled: isOpen,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    },
  )

  const filteredPlans = plansFromDatabase
    ?.sort((a, b) => a.price - b.price)
    ?.filter((plan) => !excludedPlans?.includes(plan.key) && !!planConfig?.[plan.key])

  const currentPlanData = filteredPlans?.find((plan) => plan.key === currentPlan)

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} scrollBehavior={'inside'} isCentered>
        <ModalOverlay />
        <ModalContent p={10} maxWidth="fit-content" width="100%">
          <ModalCloseButton />
          <ModalBody p={0}>
            <Stack alignItems="center">
              <Text fontSize="5xl" fontWeight="medium" color="text.normal">
                {t('billing.title')}
              </Text>
              <Box
                position="fixed"
                width="787px"
                height="787px"
                bg="rgba(0, 205, 98, 0.12)"
                filter="blur(150px)"
                left="-20%"
                top="10%"
              />
              <Box
                position="fixed"
                width="650px"
                height="650px"
                bg="rgba(0, 205, 98, 0.12)"
                filter="blur(150px)"
                right="0"
                bottom="-10%"
              />
              <Box>{isLoading && <Spinner />}</Box>
              <Stack direction="row" gap="32px" alignItems="flex-end" justifyContent="flex-start">
                {filteredPlans?.map((plan) => {
                  const planDetails = planConfig[plan.key]

                  if (!planDetails) return null

                  const isCurrent = plan.key === currentPlan
                  const isPopular = plan.key === BillingPlanType.BUSINESS
                  const isDowngrade = getDowngradeStatus(currentPlanData?.price, plan.price)

                  return (
                    <PlanPricingCard
                      key={plan.key}
                      isLoading={isLoading}
                      isCurrent={isCurrent}
                      isPopular={isPopular}
                      isDowngrade={isDowngrade}
                      onPurchase={handlePurchasePlanType}
                      planInformation={plan}
                      planIcon={planDetails.icon}
                      planDesc={planDetails.description}
                      planDetail={planDetails.detail}
                    />
                  )
                })}
              </Stack>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
      <PlanPricingCheckoutModal
        isOpen={isOpenCheckoutModal}
        onClose={onCloseCheckoutModal}
        onClick={handleCheckoutPlanType}
      />
    </>
  )
}
