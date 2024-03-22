import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useTextboxStorage'),
)

suite(`assigns string and selection, and replaces history`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useTextboxStorage/withoutOptions')
  await page.waitForSelector('input', { state: 'attached' })

  await page.evaluate(async () => {
    window.testState.textbox.record({
      string: 'Baleada',
      selection: {
        start: 'Baleada'.length,
        end: 'Baleada'.length,
        direction: 'forward',
      }
    })

    await window.nextTick()
  })

  await page.reload()
  await page.waitForSelector('input', { state: 'attached' })

  const value = await page.evaluate(async () => {
          await window.nextTick()

          return {
            historyLength: window.testState.textbox.history.array.length,
            string: window.testState.textbox.history.item.string,
            selection: JSON.parse(JSON.stringify(window.testState.textbox.history.item.selection))
          }
        }),
        expected = {
          historyLength: 1,
          string: 'Baleada',
          selection: {
            start: 'Baleada'.length,
            end: 'Baleada'.length,
            direction: 'forward',
          },
        }

  await page.evaluate(() => window.testState.cleanup())

  assert.equal(value, expected)
})

suite.run()
