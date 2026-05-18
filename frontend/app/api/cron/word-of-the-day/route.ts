import {NextRequest, NextResponse} from 'next/server'

import {promoteDueWordOfTheDay} from '@/sanity/lib/promoteWordOfTheDay'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const isCronRequest = request.headers.get('x-vercel-cron') === '1'

  if (process.env.NODE_ENV === 'production' && !isCronRequest) {
    return new Response('Unauthorized', {status: 401})
  }

  const result = await promoteDueWordOfTheDay()
  return NextResponse.json(result)
}
