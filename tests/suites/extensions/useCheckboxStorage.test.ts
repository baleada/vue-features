import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import {
  withPlaywrightOptions,
} from '../../withPlaywrightOptions'

const suite = withPlaywright(
  createSuite('useCheckboxStorage'),
  withPlaywrightOptions
)

suite('assigns checked and determinate', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCheckboxStorage/withoutOptions')
  await page.waitForSelector('input', { state: 'attached' })

  await page.evaluate(async () => {
    window.testState.checkbox.check()
    window.testState.checkbox.determinate.value = false

    await window.nextTick()
  })

  await page.reload()
  await page.waitForSelector('input', { state: 'attached' })

  const value = await page.evaluate(async () => {
          await window.nextTick()

          return {
            checked: window.testState.checkbox.checked.value,
            determinate: window.testState.checkbox.determinate.value,
          }
        }),
        expected = {
          checked: true,
          determinate: false,
        }

  await page.evaluate(() => window.testState.cleanup())

  assert.equal(value, expected)
})

suite.run()
