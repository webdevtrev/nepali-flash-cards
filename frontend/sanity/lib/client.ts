import {createClient} from 'next-sanity'

import {apiVersion, dataset, projectId, studioUrl} from '@/sanity/lib/api'
import {token} from '@/sanity/lib/token'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: {studioUrl},
})

export const publicClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})
