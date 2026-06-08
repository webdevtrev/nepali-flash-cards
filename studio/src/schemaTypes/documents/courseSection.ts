import {defineField, defineType} from 'sanity'

/**
 * Course Section schema. Represents a section in a course containing lessons.
 */
export const courseSection = defineType({
  name: 'courseSection',
  title: 'Course Section',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'description', title: 'Description', type: 'text'}),
    defineField({name: 'level', title: 'Level', type: 'string'}),
    defineField({name: 'order', title: 'Order', type: 'number'}),
    defineField({
      name: 'lessons',
      title: 'Lessons',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'lesson'}]}],
    }),
  ],
})
