import React from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import CardButton from './CardButton'
import {FaRegAngry, FaNapster, FaVuejs} from 'react-icons/fa'

const meta: Meta<typeof CardButton> = {
  title: 'Components/CardButton',
  component: CardButton,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof CardButton>

export const Primary: Story = {
  args: {
    title: 'Vue.js',
    color: '#10B981',
    icon: <FaVuejs />,
  },
}

export const WithIcon: Story = {
  args: {
    title: 'Napster',
    color: '#3B82F6',
    icon: <FaNapster />,
  },
}

export const Colored: Story = {
  args: {
    title: 'Uh Oh',
    color: '#f50b0b',
    icon: <FaRegAngry />,
  },
}
