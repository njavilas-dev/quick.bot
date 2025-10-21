import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import { invoiceSchema } from '@quickbot.io/schemas/features/billing/invoice'
import { listInvoices as listInvoicesHandler } from '@quickbot.io/billing/api/listInvoices'

export const listInvoices = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/billing/invoices',
      protect: true,
      summary: 'List invoices',
      tags: ['Billing'],
    },
  })
  .input(
    z.object({
      workspaceId: z
        .string()
        .describe('[Where to find my workspace ID?](https://docs.quick.bot/api/authentication#how-to-find-my-workspaceid)'),
    }),
  )
  .output(
    z.object({
      invoices: z.array(invoiceSchema),
    }),
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) =>
    listInvoicesHandler({ workspaceId, user }),
  )
