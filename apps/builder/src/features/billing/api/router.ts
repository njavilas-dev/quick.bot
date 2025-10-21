import { router } from '@/helpers/server/trpc'
import { getPlan } from './getPlan'
import { checkoutSubscription } from './checkoutSubscription'
import { getSubscription } from './getSubscription'
import { updateSubscription } from './updateSubscription'
import { listInvoices } from './listInvoices'
import { listPlans } from './listPlans'

export const billingRouter = router({
  getPlan,
  checkoutSubscription,
  getSubscription,
  updateSubscription,
  listInvoices,
  listPlans
})
