import {defineField, defineType} from 'sanity'
// Devanagari character object
export const devanagari = defineType({
  name: 'devanagari',
  title: 'Devanagari',
  type: 'document',
  fields: [
    defineField({
      name: 'character',
      title: 'Character',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'transliteration',
      title: 'Transliteration',
      type: 'string',
      description: 'How the character sounds in Latin script',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'audio',
      title: 'Audio',
      type: 'file',
      options: {accept: 'audio/*'},
      description: 'Optional audio file pronouncing the character',
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          {title: 'Consonant', value: 'consonant'},
          {title: 'Vowel', value: 'vowel'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
})
