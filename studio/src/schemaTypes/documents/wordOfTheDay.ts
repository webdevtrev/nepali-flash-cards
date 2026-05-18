import {format, parseISO} from 'date-fns'
import {defineField, defineType} from 'sanity'

export const wordOfTheDay = defineType({
  name: 'wordOfTheDay',
  title: 'Word of the Day',
  type: 'document',
  initialValue: {
    scheduledFor: new Date().toISOString(),
  },
  fields: [
    defineField({
      name: 'word',
      title: 'Word',
      type: 'reference',
      to: [{type: 'word'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'scheduledFor',
      title: 'Scheduled For',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
      rows: 4,
    }),
  ],
  preview: {
    select: {
      english: 'word.english',
      romanized: 'word.romanized',
      devanagari: 'word.devanagari',
      scheduledFor: 'scheduledFor',
    },
    prepare(selection) {
      const {english, romanized, devanagari, scheduledFor} = selection

      return {
        title: english || 'Untitled word of the day',
        subtitle: [
          romanized && devanagari && `${romanized} | ${devanagari}`,
          scheduledFor && `Scheduled for ${format(parseISO(scheduledFor), 'LLL d, yyyy')}`,
        ]
          .filter(Boolean)
          .join(' • '),
      }
    },
  },
})
