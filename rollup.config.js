import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'

export default {
  external: [
    '@vue/composition-api',
    '@baleada/vue-composition',
    'vue',
  ],
  input: [
    'src/index.js',
  ],
  output: {
    dir: 'lib',
    format: 'esm',
  },
  plugins: [
    babel({
      exclude: 'node_modules',
    }),
    resolve(),
  ]
}
