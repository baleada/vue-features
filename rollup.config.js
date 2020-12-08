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
        .virtualIndex('src/affordances')
        .esm({ file: 'lib/index.js', target: 'browser' })
        .configure(),
      affordancesEsm = configureable('rollup')
        .delete({ targets: 'affordances/*', verbose: true })
        .input('src/affordances/index.js')
        .external([
          '@baleada/vue-composition',
          'vue',
        ])
        .resolve()
        .virtualIndex('src/util')
        .virtualIndex('src/affordances/index.js')
        .esm({ file: 'affordances/index.js', target: 'browser' })
        .configure()

        console.log(configureable('rollup').toBabelConfig('browser'))
export default [
  esm,
  affordancesEsm,
]
