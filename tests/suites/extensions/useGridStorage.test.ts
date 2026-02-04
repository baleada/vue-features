import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import {
  withPlaywrightOptions,
} from '../../withPlaywrightOptions'

const suite = withPlaywright(
  createSuite('useGridStorage'),
  withPlaywrightOptions
)

suite('assigns focused, selected, and superselected', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useGridStorage/withoutOptions')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(async () => {
    window.testState.grid.focus.exact({ row: 1, column: 1 })
    window.testState.grid.select.exact([{ row: 0, column: 0 }, { row: 1, column: 1 }], { replace: 'all' })
    window.testState.grid.superselect.from(1)

    await window.nextTick()
  })

  await page.reload()
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          await window.nextTick()

          return {
            focused: JSON.parse(JSON.stringify(window.testState.grid.focused.value)),
            selected: JSON.parse(JSON.stringify(window.testState.grid.selected.value)),
            superselected: JSON.parse(JSON.stringify(window.testState.grid.superselected.value)),
          }
        }),
        expected = {
          focused: { row: 1, column: 1 },
          selected: [{ row: 0, column: 0 }, { row: 1, column: 1 }],
          superselected: [{ row: 1, column: 1 }],
        }

  await page.evaluate(() => window.testState.cleanup())

  assert.equal(value, expected)
})

suite.run()
