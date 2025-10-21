import { TRPCError } from '@trpc/server'
import { isDefined } from '@quickbot.io/lib'
import { User } from '@quickbot.io/prisma'
import { isAdminWriteWorkspaceForbidden } from '@quickbot.io/db-rules/isAdminWriteWorkspaceForbidden'
import { getValidWorkspace } from '../helpers/getValidWorkspace'
import { StripeService } from '../services/StripeService'

type Props = {
  workspaceId: string
  user: Pick<User, 'email' | 'id'>
}

export const listInvoices = async ({ workspaceId, user }: Props) => {
  const stripe = new StripeService()
  const workspace = await getValidWorkspace(workspaceId)

  if (isAdminWriteWorkspaceForbidden(workspace, user)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You are not allowed to update this workspace',
    })
  }
  if (!workspace?.stripeId) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Workspace stripeId not found',
    })
  }

  const invoices = await stripe.listInvoices(workspace.stripeId, 50)

  return {
    invoices: invoices.data
      .filter((invoice) => isDefined(invoice.invoice_pdf) && isDefined(invoice.id))
      .map((invoice) => ({
        id: invoice.number as string,
        url: invoice.invoice_pdf as string,
        amount: invoice.subtotal,
        currency: invoice.currency,
        date: invoice.status_transitions.paid_at,
      })),
  }
}
