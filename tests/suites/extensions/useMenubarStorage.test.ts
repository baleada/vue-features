import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import {
  withPlaywrightOptions,
} from '../../withPlaywrightOptions'

const suite = withPlaywright(
  createSuite('useMenubarStorage'),
  withPlaywrightOptions
)

suite('assigns focused, selected, and superselected', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useMenubarStorage/withoutOptions')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(async () => {
    window.testState.menubar.focusedItem.navigate(3)
    window.testState.menubar.selectedItems.pick([1, 2, 3], { replace: 'all' })
    window.testState.menubar.superselect.from(1)

    await window.nextTick()
  })

  await page.reload()
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          await window.nextTick()

          return {
            focused: window.testState.menubar.focusedItem.location,
            selected: [...window.testState.menubar.selectedItems.picks],
            superselected: [...window.testState.menubar.superselected.value],
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
