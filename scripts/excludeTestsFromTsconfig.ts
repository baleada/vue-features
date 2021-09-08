import { patchTsconfig } from './patchTsconfig'

patchTsconfig(tsconfig => ({
  ...tsconfig,
  include: [
    'src/**/*',
  ],
}))

console.log('Excluded tests from tsconfig.json')
