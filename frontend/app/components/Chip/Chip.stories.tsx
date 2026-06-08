import type {Meta, StoryObj} from '@storybook/nextjs-vite'
import Chip from './index'

const meta = {
  title: 'Components/Chip',
  component: Chip,
  parameters: {layout: 'padded'},
  tags: ['autodocs'],
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const New: Story = {args: {children: 'New', variant: 'new'}}
export const InProgress: Story = {args: {children: 'In Progress', variant: 'inProgress'}}
export const Completed: Story = {args: {children: 'Completed', variant: 'completed'}}
export const Review: Story = {args: {children: 'Review', variant: 'review'}}
export const Removable: Story = {
  args: {children: 'Removable', variant: 'new', removable: true},
}
