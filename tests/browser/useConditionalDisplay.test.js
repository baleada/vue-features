import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useConditionalDisplay (browser)')
)

suite(`conditionally toggles display between 'none' and original value`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useConditionalDisplay')

  await page.waitForSelector('span')
  const value1 = await page.evaluate(async () => {
          return window.getComputedStyle(document.querySelector('span')).display
        }),
        expected1 = 'inline'
  assert.is(value1, expected1)
  
  await page.click('button')
  const value2 = await page.evaluate(async () => {
          return window.getComputedStyle(document.querySelector('span')).display
        }),
        expected2 = 'none'

  assert.is(value2, expected2)
  
  await page.click('button')
  const value3 = await page.evaluate(async () => {
          return window.getComputedStyle(document.querySelector('span')).display
        }),
        expected3 = 'inline'

  assert.is(value3, expected3)
})

suite.run()
