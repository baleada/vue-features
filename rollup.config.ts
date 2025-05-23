import { configureable } from '@baleada/prepare'

const external = [
        /@baleada/,
        'lazy-collections',
        'vue',
      ],
      esm = new configureable.Rollup()
        .delete({ targets: 'lib/*', verbose: true })
        .input([
          'src/affordances/index.ts',
          'src/combos/index.ts',
          'src/extensions/index.ts',
          'src/extracted/public.ts',
          'src/interfaces/index.ts',
          'src/transforms/index.ts',
        ])
        .external(external)
        .treeshake('smallest')
        .resolve()
        .esbuild()
        .esm({ file: 'lib/index.js', target: 'browser' })
        .configure(),
      dts = new configureable.Rollup()
        .input([
          'types/affordances/index.d.ts',
          'types/combos/index.d.ts',
          'types/extensions/index.d.ts',
          'types/extracted/public.d.ts',
          'types/interfaces/index.d.ts',
          'types/transforms/index.d.ts',
        ])
        .external(external)
        .output({ file: 'lib/index.d.ts', format: 'esm' })
        .dts()
        .configure()

export default [
  esm,
  dts,
]
