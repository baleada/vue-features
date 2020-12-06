import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useAttributeBinding (browser)')
)

suite(`binds static values to attributes`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useAttributeBinding-static')

  await page.waitForSelector('span')
  const value = await page.evaluate(async () => {
          return document.querySelector('span').id
        }),
        expected = 'stub'

  assert.is(value, expected)
})

suite(`binds dynamic values to attributes`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useAttributeBinding-dynamic')

  await page.waitForSelector('span')
  const valueBefore = await page.evaluate(async () => {
          return document.querySelector('span').id
        }),
        expectedBefore = 'stub-0'
  
  assert.is(valueBefore, expectedBefore)
  
  await page.click('button')
  const valueAfter = await page.evaluate(async () => {
          return document.querySelector('span').id
        }),
        expectedAfter = 'stub-1'

  assert.is(valueAfter, expectedAfter)
})

suite.run()
