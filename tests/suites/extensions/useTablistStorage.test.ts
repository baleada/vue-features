import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useTablistStorage'),
)

suite('assigns focused and selected', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useTablistStorage/withoutOptions')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(async () => {
    window.testState.tablist.focus.exact(1)
    window.testState.tablist.select.exact(1)

    await window.nextTick()
  })

  await page.reload()
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          await window.nextTick()

          return {
            focused: window.testState.tablist.focused.value,
            selected: [...window.testState.tablist.selected.value],
          }
        }),
        expected = {
          focused: 1,
          selected: [1],
        }

  await page.evaluate(() => window.testState.cleanup())

  assert.equal(value, expected)
})

suite.run()
