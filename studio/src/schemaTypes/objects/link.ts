import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons'
import type {Link} from '../../../sanity.types'

/**
 * Link schema object. This link object lets the user first select the type of link and then
 * then enter the URL, page reference, or lesson reference - depending on the type selected.
 * Learn more: https://www.sanity.io/docs/studio/object-type
 */

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      initialValue: 'url',
      options: {
        list: [
          {title: 'URL', value: 'href'},
          {title: 'Lesson', value: 'lesson'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      hidden: ({parent}) => parent?.linkType !== 'href',
      validation: (Rule) =>
        // Custom validation to ensure URL is provided if the link type is 'href'
        Rule.custom((value, context) => {
          const parent = context.parent as Link
          if (parent?.linkType === 'href' && !value) {
            return 'URL is required when Link Type is URL'
          }
          return true
        }),
    }),
    defineField({
      name: 'lesson',
      title: 'Lesson',
      type: 'reference',
      to: [{type: 'lesson'}],
      hidden: ({parent}) => parent?.linkType !== 'lesson',
      validation: (Rule) =>
        // Custom validation to ensure lesson reference is provided if the link type is 'lesson'
        Rule.custom((value, context) => {
          const parent = context.parent as Link
          if (parent?.linkType === 'lesson' && !value) {
            return 'Lesson reference is required when Link Type is Lesson'
          }
          return true
        }),
    }),
    // 'lesson' link type removed — use page or href instead
    defineField({
      name: 'openInNewTab',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
