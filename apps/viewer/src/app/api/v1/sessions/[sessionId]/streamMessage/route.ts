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
  const abortController = new AbortController()

  // Auto-abort after 58 seconds (before Vercel 60s limit)
  const timeout = setTimeout(() => abortController.abort(), 58000)

  try {

    const { stream, status, message } = await getMessageStream({
      sessionId: params.sessionId
    })

    if (!stream) {
      clearTimeout(timeout)
      return NextResponse.json({ message }, { status, headers: responseHeaders })
    }

    return new Response(stream.pipeThrough(createStreamDataTransformer()), {
      headers: {
        ...responseHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  } catch (error) {
    clearTimeout(timeout)
    abortController.abort()
    throw error
  }
}

const createStreamDataTransformer = () => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  return new TransformStream({
    transform: async (chunk, controller) => {
      const decodedChunk = decoder.decode(chunk)
      if (decodedChunk[0] !== '0') return
      controller.enqueue(encoder.encode(JSON.parse(decodedChunk.slice(2))))
    },
  })
}
