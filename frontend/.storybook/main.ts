import type {StorybookConfig} from '@storybook/nextjs-vite'

import {dirname} from 'path'

import {fileURLToPath} from 'url'
import {resolve} from 'path'

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}
const config: StorybookConfig = {
  stories: ['../**/*.mdx', '../**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-docs'),
  ],
  framework: getAbsolutePath('@storybook/nextjs-vite'),
  staticDirs: ['../public'],
  async viteFinal(config) {
    // Alias `next/link` to a local mock so stories using Next Link render as anchors
    const storybookDir = dirname(fileURLToPath(import.meta.url))
    const mockPath = resolve(storybookDir, 'nextLinkMock.tsx')
    config.resolve = config.resolve || {}
    const existing = config.resolve.alias
    let aliases: any[] = []
    if (Array.isArray(existing)) aliases = existing.filter(Boolean)
    else if (existing) aliases = [existing as any]
    // Filter out any malformed alias entries that may cause Vite to throw
    aliases = aliases.filter((a) => {
      if (!a) return false
      if (typeof a === 'string') return true
      return a.find !== undefined || a.replacement !== undefined
    })
    config.resolve.alias = [...aliases, {find: 'next/link', replacement: mockPath}]
    return config
  },
}
export default config
