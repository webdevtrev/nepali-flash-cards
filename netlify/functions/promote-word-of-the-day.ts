import {Handler} from '@netlify/functions'

import {promoteDueWordOfTheDay} from '../../frontend/sanity/lib/promoteWordOfTheDay'

export const handler: Handler = async () => {
  const result = await promoteDueWordOfTheDay()

  return {
    statusCode: 200,
    body: JSON.stringify(result),
    headers: {
      'content-type': 'application/json',
    },
  }
}
