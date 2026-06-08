import React from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import FlashCards from './FlashCards'

const meta: Meta<typeof FlashCards> = {
  title: 'Components/FlashCards',
  component: FlashCards,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{height: '90vh'}}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof FlashCards>
const devanagariCards = [
  {
    type: 'devanagari',
    devanagari: 'क',
    transliteration: 'ka',
    example: {devanagari: 'कुकुर', transliteration: 'kukur', translation: 'dog'},
  },
  {
    type: 'devanagari',
    devanagari: 'ख',
    transliteration: 'kha',
    example: {devanagari: 'खुसी', transliteration: 'khusi', translation: 'happy'},
  },
]

const wordCards = [
  {
    type: 'word',
    devanagari: 'घर',
    transliteration: 'ghar',
    translation: 'house',
    pronunciation: 'ghar',
  },
  {
    type: 'word',
    devanagari: 'पानी',
    transliteration: 'pani',
    translation: 'water',
    pronunciation: 'paani',
  },
]

export const Default: Story = {
  args: {
    cards: devanagariCards as any,
  },
}

export const DevanagariSet: Story = {
  args: {
    cards: devanagariCards as any,
  },
}

export const WordSet: Story = {
  args: {
    cards: wordCards as any,
  },
}
