import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useTextboxStorage'),
)

suite(`assigns string and selection, and replaces history`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTextboxStorage/withoutOptions')
  await page.waitForSelector('input')

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.textbox.record({
      string: 'Baleada',
      selection: {
        start: 'Baleada'.length,
        end: 'Baleada'.length,
        direction: 'forward',
      }
    })

    await (window as unknown as WithGlobals).nextTick()
  })

  await page.reload()
  await page.waitForSelector('input')

  const value = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          return {
            historyLength: (window as unknown as WithGlobals).testState.textbox.history.value.array.length,
            string: (window as unknown as WithGlobals).testState.textbox.history.value.item.string,
            selection: JSON.parse(JSON.stringify((window as unknown as WithGlobals).testState.textbox.history.value.item.selection))
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

  await page.evaluate(() => (window as unknown as WithGlobals).testState.cleanup())

  assert.equal(value, expected)
})

suite.run()
