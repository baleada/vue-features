import { configureable } from '@baleada/prepare'

const esm = configureable('rollup')
        .delete({ targets: 'lib/*', verbose: true })
        .input('src')
        .external([
          '@baleada/vue-composition',
          '@baleada/logic',
          'vue',
          'nanoid',
        ])
        .resolve()
        .virtual.index('src', { include: ['src/functions/**', 'src/affordances/**'] })
        .virtual.index('src/functions')
        .virtual.index('src/util')
        .virtual.index('src/affordances')
        .esm({ file: 'lib/index.js', target: 'browser' })
        .configure()

export default [
  esm
]
