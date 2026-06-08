import {defineField, defineType} from 'sanity'

export const vowel = defineType({
  name: 'vowel',
  title: 'Vowel',
  type: 'document',
  preview: {
    select: {matra: 'matra', label: 'label', transliteration: 'transliteration'},
    prepare(selection) {
      // show matra (vowel sign) as the main glyph when available, otherwise use label
      const title = selection.matra || selection.label || ''
      const subtitle = selection.transliteration || ''
      const glyph = title || ''
      const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><rect width='100%' height='100%' fill='transparent'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Noto Sans Devanagari, serif' font-size='32'>${glyph}</text></svg>`
      // Remove media from preview to hide the media slot in Studio
      return {title, subtitle}
    },
  },
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'matra',
      title: 'Matra sign',
      type: 'string',
      description: 'Sign to attach to a consonant; empty for inherent a',
    }),
    defineField({name: 'transliteration', title: 'Transliteration', type: 'string'}),
    defineField({name: 'order', title: 'Order', type: 'number'}),
    defineField({name: 'audio', title: 'Audio', type: 'file', options: {accept: 'audio/*'}}),
  ],
})
