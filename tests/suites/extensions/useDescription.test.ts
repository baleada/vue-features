import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useDescription')
)

suite(`assigns to aria-describedby`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useDescription')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          return window.testState.identifying.value.getAttribute('aria-describedby')
        })

  assert.ok(value)
})

suite.run()
