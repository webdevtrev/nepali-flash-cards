import {defineField, defineType} from 'sanity'

/*
  This is the schema definition for a word document. It represents a single word in the flash card app. It has a title, a slug, and a definition. The slug is used to generate the URL for the word in the preview. The definition is a block content field that can contain rich text and images.

  To learn more about schema definitions, visit the Sanity documentation:
  https://www.sanity.io/docs/schema-types
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
    }),
  ],
})
