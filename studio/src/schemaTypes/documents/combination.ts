import {defineField, defineType} from 'sanity'

export const combination = defineType({
  name: 'combination',
  title: 'Combination',
  type: 'document',
  preview: {
    select: {glyph: 'glyph', transliteration: 'transliteration'},
    prepare(selection) {
      const title = selection.glyph || ''
      const subtitle = selection.transliteration || ''
      const glyph = title || ''
      const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><rect width='100%' height='100%' fill='transparent'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Noto Sans Devanagari, serif' font-size='32'>${glyph}</text></svg>`
      // Remove media from preview to hide the media slot in Studio
      return {title, subtitle}
    },
  },
  fields: [
    defineField({
      name: 'base',
      title: 'Base consonant',
      type: 'reference',
      to: [{type: 'consonant'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'vowel', title: 'Vowel', type: 'reference', to: [{type: 'vowel'}]}),
    defineField({
      name: 'glyph',
      title: 'Glyph',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'transliteration', title: 'Transliteration', type: 'string'}),
    defineField({name: 'audio', title: 'Audio', type: 'file', options: {accept: 'audio/*'}}),
    defineField({
      name: 'examples',
      title: 'Examples',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'word'}, {type: 'phrase'}]}],
    }),
    defineField({name: 'notes', title: 'Notes', type: 'text'}),
  ],
})
