import { readdirSync, statSync } from 'fs'

const barrel = [
  /^index/,
  /^public/,
]

const simpleEnoughToNotNeedTesting = [
  /^list\./,
  /^narrow/,
  /^plane\./,
  /^predicateKeycombo/,
  /^schedule/,
  /^recognizeableTypes/,
  /^toRenderedKind/,
  /^toEntries/,
  /^toTransition/,
  /^useEffecteds/,
]

const missingTests: string[] = []

for (const category of readdirSync('src')) {
  for (const file of readdirSync(`src/${category}`)) {
    if (
      barrel.some((regex) => regex.test(file))
      || simpleEnoughToNotNeedTesting.some((regex) => regex.test(file))
    ) {
      continue
    }
    
    const testFile = file.replace(/\.ts$/, '.test.ts')
    
    try {
      statSync(`tests/suites/${category}/${testFile}`)
    } catch {
      missingTests.push(`src/${category}/${file}`)
    }
  }
}

console.log(missingTests.join('\n'))
