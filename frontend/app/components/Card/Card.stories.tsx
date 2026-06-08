import React from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import Card from './index'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  args: {
    title: 'Card Title',
    subtitle: 'Card subtitle',
    children: 'This is some card content. It can include text, links, or other elements.',
  },
}

export const WithLink: Story = {
  args: {
    title: 'Linked Card',
    subtitle: 'Opens lesson',
    href: '/lessons/example-lesson',
    children: 'Clicking this card uses Next.js Link to navigate.',
  },
}

export const Clickable: Story = {
  args: {
    title: 'Clickable Card',
    children: 'This card has an onClick handler.',
  },
  render: (args) => <Card {...args} onClick={() => alert('Card clicked')} />,
}

export const NoTitle: Story = {
  args: {
    children: 'A card without a title or subtitle. Useful for plain content blocks.',
  },
}
