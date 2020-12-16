import { configureable } from '@baleada/prepare'

export default {
  ...configureable('vite')
    .alias({
      '/@src/': `/src`,
    })
    .koa(configureable => 
      configureable
        .virtualIndex('src/features/index.js')
        .virtualIndex('src/util')
        .virtualIndex('src/affordances')
        .virtualRoutes({ path: 'pages/routes.js', router: 'vue' })
        .configure()
    )
    .configure(),
}
