import { configureable } from '@baleada/prepare'

export default configureable('vite')
  .alias({
    '@src': `/src`,
  })
  .vue()
  .virtual.index('src/functions/index.js')
  .virtual.index('src/util')
  .virtual.index('src/affordances')
  .virtual.routes(
    { path: 'tests/stubs/app/src/pages/routes.js', router: 'vue' },
    { test: ({ id }) => id.endsWith('vue') }
  )
  .configure()
