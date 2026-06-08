import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'flashcard',
  title: 'Flashcard',
  type: 'object',
  fields: [
    defineField({name: 'front', title: 'Front content', type: 'string'}),
    defineField({name: 'back', title: 'Back content', type: 'text'}),
    defineField({
      name: 'sourceRef',
      title: 'Source',
      type: 'reference',
      to: [{type: 'consonant'}, {type: 'combination'}],
    }),
    defineField({name: 'audio', title: 'Audio', type: 'file', options: {accept: 'audio/*'}}),
    defineField({name: 'difficulty', title: 'Difficulty', type: 'number', initialValue: 1}),
  ],
})
