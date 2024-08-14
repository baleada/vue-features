import { readdirSync, statSync } from 'fs'

const barrel = [
  /^index/,
  /^public/,
]

const infeasibleToTest = [
  /^on\w*Rendered/,
]

const simpleEnoughToNotNeedTesting = [
  /^ability\./,
  /^coordinates/,
  /^createCoordinatesEqual/,
  /^createGetCoordinates/,
  /^list\./,
  /^narrow/,
  /^plane\./,
  /^predicateKeycombo/,
  /^predicateNullish/,
  /^predicateSomeStatusChanged/,
  /^recognizeableTypes/,
  /^schedule/,
  /^targetability/,
  /^toEntries/,
  /^toRenderedKind/,
  /^toTokenList/,
  /^toTransition/,
  /^useEffecteds/,
  /^useRootAndKeyboardTarget/,
]

const missingTests: string[] = []

for (const category of readdirSync('src')) {
  for (const file of readdirSync(`src/${category}`)) {
    if (
      barrel.some((regex) => regex.test(file))
      || simpleEnoughToNotNeedTesting.some((regex) => regex.test(file))
      || infeasibleToTest.some((regex) => regex.test(file))
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
