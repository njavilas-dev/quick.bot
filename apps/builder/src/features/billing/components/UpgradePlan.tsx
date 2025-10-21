import React from 'react'
import { useDisclosure, UseDisclosureProps } from '@chakra-ui/react'
import { PlanPricingModal, PlanPricingModalProps } from './PlanPricingModal'

type TriggerProps = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export type UpgradePlansProps = {
  trigger?: (props: TriggerProps) => React.ReactNode
  externalDisclosure?: Partial<UseDisclosureProps>
} & Omit<PlanPricingModalProps, 'isOpen' | 'onClose' | 'onOpen'>

const UpgradePlan = ({ trigger, externalDisclosure, ...props }: UpgradePlansProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure(externalDisclosure)

  return (
    <>
      {trigger && trigger({ isOpen, onOpen, onClose })}
      {isOpen && (
        <PlanPricingModal isOpen={isOpen} onClose={onClose} onOpen={onOpen} {...props} />
      )}
    </>
  )
}

export default UpgradePlan
