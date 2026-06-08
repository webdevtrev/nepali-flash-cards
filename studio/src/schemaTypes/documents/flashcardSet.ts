import {defineField, defineType} from 'sanity'

export const flashcardSet = defineType({
  name: 'flashcardSet',
  title: 'Flashcard Set',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'description', title: 'Description', type: 'text'}),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      of: [
        {type: 'flashcard'},
        {type: 'reference', to: [{type: 'consonant'}, {type: 'combination'}]},
      ],
    }),
    defineField({
      name: 'settings',
      title: 'Study Settings',
      type: 'object',
      fields: [
        {name: 'shuffle', title: 'Shuffle', type: 'boolean', initialValue: true},
        {
          name: 'spacedRepetition',
          title: 'Spaced Repetition',
          type: 'boolean',
          initialValue: false,
        },
      ],
    }),
  ],
})
