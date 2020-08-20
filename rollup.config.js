import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'

const external = [
        '@baleada/vue-composition',
        'vue',
      ],
      plugins = [
        babel({
          exclude: 'node_modules',
        }),
        resolve(),
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
