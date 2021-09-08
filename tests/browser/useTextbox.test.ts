import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../fixtures/types'

const suite = withPuppeteer(
  createSuite('useInput')
)

suite(`correctly assigns accessibility attributes`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  const value = await page.evaluate(async () => {
          return (window as unknown as WithGlobals).testState.textbox.root.element.value.id.length
        }),
        expected = 21

  assert.is(value, expected)
})

// models input value on completeable string
// models input selection on completeable selection
//    - pointerup
//    - focus
//    - arrow keys
//    - arrow keys + meta

suite.run()
