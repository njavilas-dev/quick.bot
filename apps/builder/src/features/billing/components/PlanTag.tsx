import { Tag, TagProps, ThemeTypings } from '@chakra-ui/react'
import { BillingPlanType } from '@quickbot.io/prisma'

export const planColorSchemes: Record<BillingPlanType, ThemeTypings['colorSchemes']> = {
  [BillingPlanType.FREE]: 'gray',
  [BillingPlanType.PERSONAL]: 'green',
  [BillingPlanType.BUSINESS]: 'blue',
  [BillingPlanType.ENTERPRISE]: 'purple',
  [BillingPlanType.CUSTOM]: 'orange',
  [BillingPlanType.UNLIMITED]: 'red',
}

export const PlanTag = ({ plan, ...props }: { plan: BillingPlanType } & TagProps): JSX.Element => {
  switch (plan) {
    case BillingPlanType.FREE: {
      return (
        <Tag colorScheme={planColorSchemes[BillingPlanType.FREE]} data-testid="free-plan-tag" {...props}>
          Free
        </Tag>
      )
    }
    case BillingPlanType.PERSONAL: {
      return (
        <Tag colorScheme={planColorSchemes[plan]} data-testid="personal-plan-tag" {...props}>
          Personal
        </Tag>
      )
    }
    case BillingPlanType.BUSINESS: {
      return (
        <Tag colorScheme={planColorSchemes[plan]} data-testid="business-plan-tag" {...props}>
          Business
        </Tag>
      )
    }
    case BillingPlanType.ENTERPRISE: {
      return (
        <Tag
          colorScheme={planColorSchemes[BillingPlanType.ENTERPRISE]}
          data-testid="custom-unlimite-tag"
          {...props}
        >
          Enterprise
        </Tag>
      )
    }
    case BillingPlanType.CUSTOM: {
      return (
        <Tag
          colorScheme={planColorSchemes[BillingPlanType.CUSTOM]}
          data-testid="custom-plan-tag"
          {...props}
        >
          Custom
        </Tag>
      )
    }
    case BillingPlanType.UNLIMITED: {
      return (
        <Tag
          colorScheme={planColorSchemes[BillingPlanType.UNLIMITED]}
          data-testid="custom-unlimite-tag"
          {...props}
        >
          Unlimited
        </Tag>
      )
    }
  }
}
