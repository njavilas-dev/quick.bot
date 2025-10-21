import { WorkspaceDashboardFolder } from '@quickbot.io/prisma'
import { z } from 'zod'

export const folderSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  parentFolderId: z.string().nullable(),
  workspaceId: z.string(),
}) satisfies z.ZodType<WorkspaceDashboardFolder>

export type Folder = z.infer<typeof folderSchema>
