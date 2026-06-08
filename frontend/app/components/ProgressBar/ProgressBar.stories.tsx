import React from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import ProgressBar from './ProgressBar'

const meta: Meta<typeof ProgressBar> = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof ProgressBar>

export const Zero: Story = {
  args: {
    progress: 0,
  },
}

export const Quarter: Story = {
  args: {
    progress: 25,
  },
}

export const Half: Story = {
  args: {
    progress: 50,
  },
}

export const Full: Story = {
  args: {
    progress: 100,
  },
}

export const SmallQuarter: Story = {
  args: {
    progress: 25,
    size: 'small',
  },
}

export const MediumHalf: Story = {
  args: {
    progress: 50,
    size: 'medium',
  },
}

export const LargeFull: Story = {
  args: {
    progress: 100,
    size: 'large',
  },
}

export const Determinate45: Story = {
  args: {
    progress: 45,
    size: 'medium',
    style: 'determinate',
  },
}

export const Segmented: Story = {
  args: {
    progress: 3,
    style: 'segmented',
    segments: 5,
  },
}
