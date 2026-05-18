import {defineField, defineType} from 'sanity'

export const word = defineType({
  name: 'word',
  title: 'Word',
  type: 'document',
  fields: [
    defineField({
      name: 'english',
      title: 'English',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'romanized',
      title: 'Romanized',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'devanagari',
      title: 'Devanagari',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pronunciation',
      title: 'Pronunciation',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'reference', to: {type: 'tags'}}],
    }),
    defineField({
      name: 'migrateToPhrase',
      title: 'Migrate to Phrase',
      type: 'boolean',
    }),
  ],
  preview: {
    select: {
      english: 'english',
      romanized: 'romanized',
      devanagari: 'devanagari',
    },
    prepare(selection) {
      const {english, romanized, devanagari} = selection
      return {
        title: english,
        subtitle: `${romanized} | ${devanagari}`,
      }
    },
  },
})
