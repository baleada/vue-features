import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import virtual from '@baleada/rollup-plugin-virtual'
import createFilesToIndex from '@baleada/source-transform-files-to-index'

const srcFilesToIndex = createFilesToIndex({ test: ({ id }) => /src\/[^\/]+.js$/.test(id) }),
      utilFilesToIndex = createFilesToIndex({ test: ({ id }) => /src\/util\/[^\/]+.js$/.test(id) })

const external = [
        '@baleada/vue-composition',
        'vue',
        /@babel\/runtime/,
      ],
      plugins = [
        resolve(),
        virtual({
          test: ({ id }) => id.endsWith('src/index.js'),
          transform: srcFilesToIndex,
        }),
        virtual({
          test: ({ id }) => id.endsWith('src/util'),
          transform: utilFilesToIndex,
        }),
        virtual({
          test: ({ id }) => id.endsWith('src/util/index.js'),
          transform: utilFilesToIndex,
        }),
        babel({
          exclude: 'node_modules',
          babelHelpers: 'runtime'
        }),
      ]
export default [
  {
    external,
    input: [
      'src/index.js',
    ],
    output: {
      dir: 'lib',
      format: 'esm',
    },
    plugins,
  },
  {
    external,
    input: [
      'src/util/index.js',
    ],
    output: {
      dir: 'util',
      format: 'esm',
    },
    plugins,
  },
]
