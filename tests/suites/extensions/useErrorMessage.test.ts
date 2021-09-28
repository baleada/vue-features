import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useErrorMessage')
)

suite(`assigns to aria-errormessage`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useErrorMessage')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          return (window as unknown as WithGlobals).testState.identifying.value.getAttribute('aria-errormessage')
        })

  assert.ok(value)
})

suite.run()
