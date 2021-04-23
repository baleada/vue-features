import { configureable } from '@baleada/prepare'

console.log(new configureable.Vite().pages)

export default new configureable.Vite()
  .alias({
    '@src': `/src`,
  })
  .includeDeps([
    '@baleada/logic'
  ])
  .vue()
  .pages({
    pagesDir: 'tests/stubs/app/src/pages',
    extensions: ['vue']
  })
  .configure()
