import { defineConfig } from 'vocs'
import { sidebar } from './site/sidebar'

export default defineConfig({
  title: 'Sign Protocol SDK',
  rootDir: './site',
  theme: {
    accentColor: 'rgb(243, 135, 68)',
  },
  topNav: [
    {
      text: 'Docs',
      link: '/docs/getting-started',
      match: '/docs',
    },
  ],
  sidebar,
})
