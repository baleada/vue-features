import { configureable } from '@baleada/prepare'

export default {
  ...configureable('vite')
    .alias({
      '/@src/': `/src`,
    })
    .koa(configureable => 
      configureable
        .virtualIndex('src/index.js', {
          test: ({ id }) => /(^|\/)src\/\w+\.js/.test(id),
        })
        .virtualIndex('src/util')
        .virtualIndex('src/affordances')
        .virtualRoutes({ path: 'pages/routes.js', router: 'vue' })
        .configure()
    )
    .configure(),
}
