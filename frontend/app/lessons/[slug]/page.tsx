import type {Metadata, ResolvingMetadata} from 'next'
import {notFound} from 'next/navigation'
import {type PortableTextBlock} from 'next-sanity'
import {Suspense} from 'react'

import Avatar from '@/app/components/Avatar'
import {MoreLessons} from '@/app/components/Posts'
import PortableText from '@/app/components/PortableText'
import Image from '@/app/components/SanityImage'
import {sanityFetch} from '@/sanity/lib/live'
import {lessonPagesSlugs, lessonQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'

type Props = {
  params: Promise<{slug: string}>
}

/**
 * Generate the static params for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: lessonPagesSlugs,
    // Use the published perspective in generateStaticParams
    perspective: 'published',
    stega: false,
  })
  return data
}

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params
  const {data: lesson} = await sanityFetch({
    query: lessonQuery,
    params,
    // Metadata should never contain stega
    stega: false,
  })
  const previousImages = (await parent).openGraph?.images || []
  const ogImage = resolveOpenGraphImage(lesson?.coverImage)

  return {
    authors:
      lesson?.author?.firstName && lesson?.author?.lastName
        ? [{name: `${lesson.author.firstName} ${lesson.author.lastName}`}]
        : [],
    title: lesson?.title,
    description: lesson?.excerpt,
    openGraph: {
      images: ogImage ? [ogImage, ...previousImages] : previousImages,
    },
  } satisfies Metadata
}

export default async function LessonPage(props: Props) {
  const params = await props.params
  const [{data: lesson}] = await Promise.all([sanityFetch({query: lessonQuery, params})])

  if (!lesson?._id) {
    return notFound()
  }

  return (
    <>
      <div className="">
        <div className="container my-12 lg:my-24 grid gap-12">
          <div>
            <div className="pb-6 grid gap-6 mb-6 border-b border-gray-100">
              <div className="max-w-3xl flex flex-col gap-6">
                <h1 className="text-4xl text-gray-900 sm:text-5xl lg:text-7xl">{lesson.title}</h1>
              </div>
              <div className="max-w-3xl flex gap-4 items-center">
                {lesson.author && lesson.author.firstName && lesson.author.lastName && (
                  <Avatar person={lesson.author} date={lesson.date} />
                )}
              </div>
            </div>
            <article className="gap-6 grid max-w-4xl">
              <div className="">
                {lesson?.coverImage && (
                  <Image
                    id={lesson.coverImage.asset?._ref || ''}
                    alt={lesson.coverImage.alt || ''}
                    className="rounded-sm w-full"
                    width={1024}
                    height={538}
                    mode="cover"
                    hotspot={lesson.coverImage.hotspot}
                    crop={lesson.coverImage.crop}
                  />
                )}
              </div>
              {lesson.content?.length && (
                <PortableText
                  className="max-w-2xl prose-headings:font-medium prose-headings:tracking-tight"
                  value={lesson.content as PortableTextBlock[]}
                />
              )}
            </article>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="container py-12 lg:py-24 grid gap-12">
          <aside>
            <Suspense>{await MoreLessons({skip: lesson._id, limit: 2})}</Suspense>
          </aside>
        </div>
      </div>
    </>
  )
}
