import { configureable } from '@baleada/prepare'

const esm = configureable('rollup')
        .delete({ targets: 'lib/*', verbose: true })
        .input('src/features')
        .external([
          '@baleada/vue-composition',
          'vue',
          'nanoid',
        ])
        .resolve()
        .virtual.index('src/features')
        .virtual.index('src/util')
        .virtual.index('src/affordances')
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
        .virtual.index('src/util')
        .virtual.index('src/affordances/index.js')
        .esm({ file: 'affordances/index.js', target: 'browser' })
        .configure()

export default [
  esm,
  affordancesEsm,
]
