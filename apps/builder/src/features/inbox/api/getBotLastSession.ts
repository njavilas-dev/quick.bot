import { authenticatedProcedure } from '@/helpers/server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import prisma from '@quickbot.io/lib/prisma';
import { sessionStateSchema } from '@quickbot.io/schemas';
import { isReadBotForbidden } from '@/features/bot/helpers/isReadBotForbidden';

const inputSchema = z.object({
  botId: z.string().describe('The bot ID'),
  resultId: z.string().describe('The chat session ID or result ID to get the associated chat session'),
});

const metadataSchema = z.object({
  currentBlockId: z.string().optional(),
  channel: z.enum(['web', 'whatsapp']),
  whatsappNumber: z.string().optional(),
  lastMessage: z.string().optional(),
}).optional();

const outputSchema = z.object({
  session: z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    isReplying: z.boolean().optional(),
    metadata: metadataSchema,
  }),
  theme: z.any().optional(), // Bot theme for styling
});

export const getBotLastSession = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/inbox/{botId}/{resultId}',
      protect: true,
      summary: 'Get a specific last chat session for a bot result',
      tags: ['Inbox'],
    },
  })
  .input(inputSchema)
  .output(outputSchema)
  .query(async ({ input: { botId, resultId }, ctx: { user } }) => {

    // Verify that the bot exists and the user has permissions
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      select: {
        id: true,
        theme: true, // Include theme for styling
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


    // Try to find BotResult by sessionId first (lastChatSessionId), then by resultId
    const botResult = await prisma.botResult.findFirst({
      where: {
        botId: botId,
        isArchived: { not: true },
        OR: [
          { id: resultId },                    // Search by resultId
          { lastChatSessionId: resultId },     // Search by sessionId
        ],
      },
      select: {
        id: true,
        lastChatSessionId: true,
      },
    });

    if (!botResult) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Result not found' });
    }

    if (!botResult.lastChatSessionId) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No chat session associated with this result' });
    }


    // Get the chat session
    const session = await prisma.chatSession.findUnique({
      where: { id: botResult.lastChatSessionId },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        state: true,
        isReplying: true,
        lastWhatsAppMessageId: true,
      },
    });

    if (!session) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Chat session not found' });
    }


    // Parse the session state to extract metadata
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
      session: {
        id: botResult.id,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        isReplying: session.isReplying ?? undefined,
        metadata,
      },
      theme: bot.theme, // Include bot theme
    };
  });
