import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useDetails')
)

suite(`assigns to aria-details`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useDetails')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          return (window as unknown as WithGlobals).testState.identifying.value.getAttribute('aria-details')
        })

  assert.ok(value)
})

suite.run()
