import {defineConfig} from 'vite'

export default defineConfig({
  plugins: [
    {
      name: 'fix-moduleType',
      enforce: 'pre',
      transform(code, id) {
        // Skip processing certain problematic file types
        if (typeof id !== 'string') {
          return null
        }
        return null
      },
    },
  ],
})
