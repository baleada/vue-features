import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('navigateOnBasic')
)

suite(`home key navigates to first eligible`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/navigateOnBasic')
  await page.waitForSelector('input')

  await page.click('input')
  await page.keyboard.press('Tab')
  
  await page.keyboard.press('Home')
  const value = await page.evaluate(async () => {
          return (window as unknown as WithGlobals).testState.navigateable.value.location
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`end key navigates to first eligible`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/navigateOnBasic')
  await page.waitForSelector('input')

  await page.click('input')
  await page.keyboard.press('Tab')
  
  await page.keyboard.press('End')
  const value = await page.evaluate(async () => {
          return (window as unknown as WithGlobals).testState.navigateable.value.location
        }),
        expected = 2

  assert.is(value, expected)
})

suite.run()
