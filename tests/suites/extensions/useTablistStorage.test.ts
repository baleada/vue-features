import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useTablistStorage'),
)

suite('assigns focused and selected', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTablistStorage/withoutOptions')
  await page.waitForSelector('div')

  await page.evaluate(async () => {
    window.testState.tablist.focus.exact(1)
    window.testState.tablist.select.exact(1)

    await window.nextTick()
  })

  await page.reload()
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
          await window.nextTick()

          return {
            focused: window.testState.tablist.focused.location,
            selected: [...window.testState.tablist.selected.picks],
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
