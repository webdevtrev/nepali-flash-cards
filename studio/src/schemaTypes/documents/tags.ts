import {defineField, defineType} from 'sanity'

/*
  This is the schema definition for a tag document. Tags are used to categorize words in the flash card app.
*/

export const tags = defineType({
  name: 'tags',
  title: 'Tags',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
      description: 'The name of this tag category',
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
