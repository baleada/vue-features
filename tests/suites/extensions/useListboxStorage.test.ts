import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import {
  withPlaywrightOptions,
} from '../../withPlaywrightOptions'

const suite = withPlaywright(
  createSuite('useListboxStorage'),
  withPlaywrightOptions
)

suite('assigns focused, selected, and superselected', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useListboxStorage/multiselectable')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(async () => {
    window.testState.listbox.focusedOption.navigate(3)
    window.testState.listbox.selectedOptions.pick([1, 2, 3], { replace: 'all' })
    window.testState.listbox.superselect.from(1)

    await window.nextTick()
  })

  await page.reload()
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          await window.nextTick()

          return {
            focused: window.testState.listbox.focusedOption.location,
            selected: [...window.testState.listbox.selectedOptions.picks],
            superselected: [...window.testState.listbox.superselected.value],
          }
        }),
        expected = {
          focused: 3,
          selected: [1, 2, 3],
          superselected: [2, 3],
        }

  await page.evaluate(() => window.testState.cleanup())

  assert.equal(value, expected)
})

suite.run()
