import { configureable } from '@baleada/prepare'

export default new configureable.Vite()
  .alias({
    '@src': `/src`,
  })
  .includeDeps([
    '@baleada/logic'
  ])
  .vue()
  .vueJsx()
  .vueMacros()
  .pages({
    pagesDir: 'tests/stubs/app/src/pages',
    extensions: ['vue']
  })
  .configure()
