import { configureable } from '@baleada/prepare'

export default {
  ...configureable('vite')
    .alias({
      '/@src/': `/src`,
    })
    .koa(configureable => 
      configureable
        .virtual.index('src/features/index.js')
        .virtual.index('src/util')
        .virtual.index('src/affordances')
        .virtual.routes(
          { path: 'pages/routes.js', router: 'vue' },
          { test: ({ id }) => id.endsWith('vue') }
        )
        .configure()
    )
    .configure(),
}
