import { authenticatedProcedure } from '@/helpers/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import prisma from '@quickbot.io/lib/prisma';
import { sessionStateSchema } from '@quickbot.io/schemas';
import { isReadBotForbidden } from '@/features/bot/helpers/isReadBotForbidden';

const maxLimit = 100;

const inputSchema = z.object({
  botId: z.string().describe('The bot ID to list sessions for'),
  limit: z.coerce.number().min(1).max(maxLimit).default(25).describe('Number of sessions to return'),
  offset: z.coerce.number().min(0).default(0).describe('Number of sessions to skip'),
});

const metadataSchema = z.object({
  currentBlockId: z.string().optional(),
  channel: z.enum(['web', 'whatsapp']),
  whatsappNumber: z.string().optional(),
  lastMessage: z.string().optional(),
}).optional();

const outputSchema = z.object({
  sessions: z.array(
    z.object({
      id: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
      isReplying: z.boolean().optional(),
      metadata: metadataSchema,
    })
  ),
  pagination: z.object({
    limit: z.number(),
    offset: z.number(),
    nextOffset: z.number().optional(),
    hasMore: z.boolean(),
    total: z.number(),
  }),
});

export const listBotLastSessions = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/inbox/{botId}',
      protect: true,
      summary: 'List last chat sessions for a bot',
      tags: ['Inbox'],
    },
  })
  .input(inputSchema)
  .output(outputSchema)
  .query(async ({ input: { botId, limit, offset }, ctx: { user } }) => {

    // Verify that the bot exists and the user has permissions
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: {
        id: true,
        workspace: {
          select: {
            isSuspended: true,
            isPastDue: true,
            members: {
              select: { userId: true },
            },
          },
        },
        botCollaborators: {
          select: { userId: true },
        },
      },
    });

    if (!bot || (await isReadBotForbidden(bot, user))) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Bot not found' });
    }


    // Get all the BotResults that have lastChatSessionId
    const botResults = await prisma.botResult.findMany({
      where: {
        botId: botId,
        lastChatSessionId: { not: null },
        isArchived: { not: true },
      },
      select: { 
        id: true,
        lastChatSessionId: true },
    });

    const sessionIds = botResults
      .map((result) => result.lastChatSessionId)
      .filter((sessionId): sessionId is string => !!sessionId);


    if (!sessionIds.length) {
      return {
        sessions: [],
        pagination: {
          limit,
          offset,
          hasMore: false,
          total: 0,
        },
      };
    }

    // Count the total number of matching sessions
    const total = await prisma.chatSession.count({
      where: { id: { in: sessionIds } },
    });


    // Get the sessions with pagination
    const sessions = await prisma.chatSession.findMany({
      where: { id: { in: sessionIds } },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        state: true,
        isReplying: true,
        lastWhatsAppMessageId: true,
      },
    });

    // Build BotResult map
    const pageSessionIdsSet = new Set(sessions.map((s) => s.id));
    const sessionToBotResultMap: Record<string, string> = {};
    botResults.forEach((result) => {
      const sid = result.lastChatSessionId;
      if (sid && pageSessionIdsSet.has(sid)) {
        sessionToBotResultMap[sid] = result.id;
      }
    });

    // Extract metadata
    const mappedSessions = sessions.map((session) => {
      const parsed = sessionStateSchema.safeParse(session.state);
      const currentBlockId = parsed.success ? parsed.data.currentBlockId : undefined;
      const systemPlatform = parsed.success && parsed.data.botsQueue?.[0]?.bot?.variables?.find(
      (v: { id: string; value?: string | (string | null)[] | null | undefined }) => v.id === 'system_platform')?.value;
      const systemWhatsappNumber = parsed.success && parsed.data.botsQueue?.[0]?.bot?.variables?.find(
      (v: { id: string; value?: string | (string | null)[] | null | undefined }) => v.id === 'system_whatsapp_number')?.value;
      const hasWhatsAppMessageId = !!session.lastWhatsAppMessageId;
      const channel: 'web' | 'whatsapp' = systemPlatform === "whatsapp" || hasWhatsAppMessageId ? 'whatsapp' : 'web';

      // Ensure whatsappNumber is always a string or undefined
      const whatsappNumber = typeof systemWhatsappNumber === 'string' ? systemWhatsappNumber : undefined;

      // Get last message from answers
      const answers = parsed.success && parsed.data.botsQueue?.[0]?.answers;
      const lastAnswer = answers && answers.length > 0 ? answers[answers.length - 1] : undefined;
      const lastMessage = lastAnswer?.value || undefined;

      const metadata = metadataSchema.parse(
        currentBlockId || channel || whatsappNumber || lastMessage ? { currentBlockId, channel, whatsappNumber, lastMessage } : undefined
      );

      return {
        id: sessionToBotResultMap[session.id],
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        isReplying: session.isReplying ?? undefined,
        metadata,
      };
    });

    const hasMore = offset + sessions.length < total;
    const nextOffset = hasMore ? offset + limit : undefined;


    return {
      sessions: mappedSessions,
      pagination: {
        limit,
        offset,
        nextOffset,
        hasMore,
        total,
      },
    };
  });

