import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useListBinding (browser)')
)

suite(`binds static values to lists, and retains original values`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useListBinding/static')

  await page.waitForSelector('span')
  const value = await page.evaluate(async () => {
          return [...document.querySelector('span').classList]
        }),
        expected = ['stub', 'red']

  assert.equal(value, expected)
})

suite(`binds dynamic values to lists, and retains original values`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useListBinding/dynamic')

  await page.waitForSelector('span')
  const valueBefore = await page.evaluate(async () => {
          return [...document.querySelector('span').classList]
        }),
        expectedBefore = ['stub', 'red']
  
  assert.equal(valueBefore, expectedBefore)
  
  await page.click('button')
  const valueAfter = await page.evaluate(async () => {
          return [...document.querySelector('span').classList]
        }),
        expectedAfter = ['stub', 'blue']

  assert.equal(valueAfter, expectedAfter)
})

suite.run()
