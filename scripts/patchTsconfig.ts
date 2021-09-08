import  { readFileSync, writeFileSync } from 'fs'

export function patchTsconfig (transformTsconfig: (tsconfig: Record<any, any>) => Record<any, any>) {
  const tsconfig = JSON.parse(readFileSync('tsconfig.json', 'utf8'))
  writeFileSync('tsconfig.json', JSON.stringify(transformTsconfig(tsconfig), null, 2))
}
