import { configureable } from '@baleada/prepare'

const external = [
        '@baleada/vue-composition',
        '@baleada/logic',
        '@baleada/recognizeable-effects',
        'vue',
        'nanoid',
        'lazy-collections',
      ],
      esm = new configureable.Rollup()
        .delete({ targets: 'lib/*', verbose: true })
        .input(['src/affordances/index.ts', 'src/functions/index.ts', 'src/extensions/index.ts'])
        .external(external)
        .resolve()
        .esbuild()
        .esm({ file: 'lib/index.js', target: 'browser' })
        .configure(),
      dts = new configureable.Rollup()
        .input(['types/affordances/index.d.ts', 'types/functions/index.d.ts', 'types/extensions/index.d.ts'])
        .external(external)
        .output({ file: 'lib/index.d.ts', format: 'esm' })
        .dts()
        .configure()

export default [
  esm,
  dts
]
