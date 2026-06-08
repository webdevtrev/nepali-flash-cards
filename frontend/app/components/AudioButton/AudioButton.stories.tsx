import React from 'react'
import type {Meta, StoryObj} from '@storybook/react'
import AudioButton from './AudioButton'
// Use a public short test audio file so Storybook / build won't fail
const testFile = 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3'

const meta: Meta<typeof AudioButton> = {
  title: 'Components/AudioButton',
  component: AudioButton,
  argTypes: {
    variant: {control: {type: 'select'}, options: ['primary', 'secondary', 'ghost', 'speaker']},
    size: {control: {type: 'select'}, options: ['small', 'medium', 'large']},
  },
}

export default meta
type Story = StoryObj<typeof AudioButton>

export const Primary: Story = {
  args: {src: testFile, variant: 'primary'},
}

export const Secondary: Story = {
  args: {src: testFile, variant: 'secondary'},
}

export const Ghost: Story = {
  args: {src: testFile, variant: 'ghost'},
}

export const Speaker: Story = {
  args: {src: testFile, variant: 'speaker'},
}

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
      <AudioButton src={testFile} variant="primary" size="small" />
      <AudioButton src={testFile} variant="primary" size="medium" />
      <AudioButton src={testFile} variant="primary" size="large" />
    </div>
  ),
}

export const Disabled: Story = {
  args: {src: testFile, disabled: true},
}
