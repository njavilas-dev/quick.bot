import { trpc } from '@/lib/trpc'
import { useRouter } from 'next/router'
import { useToast } from '@urbiport/ui'
import { useTranslate } from '@tolgee/react'
import { BillingPlanType } from '@quickbot.io/prisma'
import { WorkspaceInApp } from '@/hooks/useWorkspace'
import { useUser } from '@/hooks/useUser'
import posthog from 'posthog-js'

export const useSubscription = (workspace?: WorkspaceInApp, enabled: boolean = true) => {
  const router = useRouter()
  const { t } = useTranslate()
  const { user } = useUser()
  const { showToast } = useToast()
  const trpcContext = trpc.useContext()

  const {
    data,
    refetch,
    isLoading: isLoadingData,
  } = trpc.billing.getSubscription.useQuery(
    {
      workspaceId: workspace?.id ?? '',
    },
    {
      enabled: enabled && !!workspace?.id,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
    },
  )

  const { mutate: updateSubscription, isLoading: isLoadingUpdate } =
    trpc.billing.updateSubscription.useMutation({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any, variables) => {
        showToast({
          detailsTitle: t('toast.details'),
          description: error.message,
        })
        posthog.capture('billing_update_error', {
          user_id: user?.id,
          email: user?.email,
          name: user?.name,
          workspace_id: (variables as { workspaceId?: string })?.workspaceId ?? workspace?.id,
          plan: (variables as { plan?: BillingPlanType })?.plan,
          currency: (variables as { currency?: string })?.currency,
          message: error?.message,
          code: error?.data?.code,
          source: 'frontend',
        })
      },
      onSuccess: ({ workspace, checkoutUrl }) => {
        if (checkoutUrl) {
          router.push(checkoutUrl)
          return
        }
        refetch()
        trpcContext.workspace.getWorkspace.invalidate()
        showToast({
          detailsTitle: t('toast.details'),
          status: 'success',
          description: t('billing.updateSuccessToast.description', {
            plan: workspace?.billingPlan.key,
          }),
        })
      },
    })

  const { mutate: checkoutSubscription, isLoading: isLoadingCheckout } =
    trpc.billing.checkoutSubscription.useMutation({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any, variables) => {
        showToast({
          detailsTitle: t('toast.details'),
          description: error.message,
        })
        posthog.capture('billing_checkout_error', {
          user_id: user?.id,
          email: user?.email,
          name: user?.name,
          workspace_id: (variables as { workspaceId?: string })?.workspaceId ?? workspace?.id,
          plan: (variables as { plan?: BillingPlanType })?.plan,
          currency: (variables as { currency?: string })?.currency,
          message: error?.message,
          code: error?.data?.code,
          source: 'frontend',
        })
      },
      onSuccess: ({ checkoutUrl }) => {
        router.push(checkoutUrl)
      },
    })

  const handlePurchaseSubscription = async (plan: BillingPlanType): Promise<void> => {
    if (!user || !workspace) return
    const newSubscription = {
      plan,
      workspaceId: workspace.id,
      currency: data?.currency ?? 'usd',
    }

    if (workspace.stripeId) {
      return updateSubscription({
        ...newSubscription,
        returnUrl: window.location.href,
      })
    } else {
      return checkoutSubscription({
        ...newSubscription,
        returnUrl: window.location.href,
      })
    }
  }

  return {
    handlePurchaseSubscription,
    subscriptionData: data,
    isLoading: isLoadingData || isLoadingUpdate || isLoadingCheckout,
  }
}
