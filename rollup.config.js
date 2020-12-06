import { configureable } from '@baleada/prepare'

const esm = configureable('rollup')
        .delete({ targets: 'lib/*', verbose: true })
        .input('src/index.js')
        .external([
          '@baleada/vue-composition',
          'vue',
        ])
        .resolve()
        .virtualIndex('src/index.js', {
          test: ({ id }) => /(^|\/)src\/\w+\.js/.test(id),
        })
        .virtualIndex('src/util')
        .esm({ file: 'lib/index.js', target: 'browser' })
        .configure(),
      utilEsm = configureable('rollup')
        .delete({ targets: 'util/*', verbose: true })
        .input('src/util/index.js')
        .external([
          '@baleada/vue-composition',
          'vue',
        ])
        .resolve()
        .virtualIndex('src/util/index.js')
        .esm({ file: 'util/index.js', target: 'browser' })
        .configure()

export default [
  esm,
  utilEsm,
]
