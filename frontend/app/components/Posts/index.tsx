import Link from 'next/link'

import {sanityFetch} from '@/sanity/lib/live'
import {moreLessonsQuery, allLessonsQuery} from '@/sanity/lib/queries'
import {AllLessonsQueryResult} from '@/sanity.types'
import DateComponent from '@/app/components/Date'
import OnBoarding from '@/app/components/Onboarding'
import Avatar from '@/app/components/Avatar'
import {dataAttr} from '@/sanity/lib/utils'

const Lesson = ({lesson}: {lesson: AllLessonsQueryResult[number]}) => {
  const {_id, title, slug, excerpt, date, author} = lesson

  return (
    <article
      data-sanity={dataAttr({id: _id, type: 'lesson', path: 'title'}).toString()}
      key={_id}
      className="border border-gray-200 rounded-sm p-6 bg-gray-50 flex flex-col justify-between transition-colors hover:bg-white relative"
    >
      <Link className="hover:text-brand underline transition-colors" href={`/lessons/${slug}`}>
        <span className="absolute inset-0 z-10" />
      </Link>
      <div>
        <h3 className="text-2xl mb-4">{title}</h3>

        <p className="line-clamp-3 text-sm leading-6 text-gray-600 max-w-[70ch]">{excerpt}</p>
      </div>
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        {author && author.firstName && author.lastName && (
          <div className="flex items-center">
            <Avatar person={author} small={true} />
          </div>
        )}
        <time className="text-gray-500 text-xs font-mono" dateTime={date}>
          <DateComponent dateString={date} />
        </time>
      </div>
    </article>
  )
}

const Lessons = ({
  children,
  heading,
  subHeading,
}: {
  children: React.ReactNode
  heading?: string
  subHeading?: string
}) => (
  <div>
    {heading && <h2 className="text-3xl text-gray-900 sm:text-4xl lg:text-5xl">{heading}</h2>}
    {subHeading && <p className="mt-2 text-lg leading-8 text-gray-600">{subHeading}</p>}
    <div className="pt-6 space-y-6">{children}</div>
  </div>
)

export const MoreLessons = async ({skip, limit}: {skip: string; limit: number}) => {
  const {data} = await sanityFetch({
    query: moreLessonsQuery,
    params: {skip, limit},
  })

  if (!data || data.length === 0) {
    return null
  }

  return (
    <Lessons heading={`Recent Lessons (${data?.length})`}>
      {data?.map((lesson: AllLessonsQueryResult[number]) => (
        <Lesson key={lesson._id} lesson={lesson} />
      ))}
    </Lessons>
  )
}

export const AllLessons = async () => {
  const {data} = await sanityFetch({query: allLessonsQuery})

  if (!data || data.length === 0) {
    return <OnBoarding />
  }

  return (
    <Lessons
      heading="Recent Lessons"
      subHeading={`${data.length === 1 ? 'This lesson is' : `These ${data.length} lessons are`} populated from your Sanity Studio.`}
    >
      {data.map((lesson: AllLessonsQueryResult[number]) => (
        <Lesson key={lesson._id} lesson={lesson} />
      ))}
    </Lessons>
  )
}

// Keep these exports for backwards compatibility during migration
export const Post = Lesson
export const MorePosts = MoreLessons
export const AllPosts = AllLessons
export const Posts = Lessons
