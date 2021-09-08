import { patchTsconfig } from './patchTsconfig'

patchTsconfig(tsconfig => ({
  ...tsconfig,
  include: [
    'src/**/*',
    'tests/**/*',
  ],
}))

console.log('Included tests in tsconfig.json')
