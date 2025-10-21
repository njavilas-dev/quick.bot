import { getMessageStream } from '@quickbot.io/bot-engine/apiHandlers/getMessageStream'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const responseHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Expose-Headers': 'Content-Length, X-JSON',
  'Access-Control-Allow-Headers': '*',
}

export async function OPTIONS() {
  return new Response('ok', {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Expose-Headers': 'Content-Length, X-JSON',
      'Access-Control-Allow-Headers': '*',
    },
  })
}

export async function POST(req: Request, { params }: { params: { sessionId: string } }) {
  const { stream, status, message } = await getMessageStream({
    sessionId: params.sessionId,
  })
  if (!stream) return NextResponse.json({ message }, { status, headers: responseHeaders })
  return new Response(stream, {
    headers: responseHeaders,
  })
}
