import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useTablistStorage'),
)

suite(`assigns string and selection, and replaces history`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTablistStorage/withoutOptions')
  await page.waitForSelector('div')

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.tablist.select.tab(1);
    (window as unknown as WithGlobals).testState.tablist.select.panel(1);

    await (window as unknown as WithGlobals).nextTick()
  })

  await page.reload()
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          return {
            tab: (window as unknown as WithGlobals).testState.tablist.selected.value.tab,
            panel: (window as unknown as WithGlobals).testState.tablist.selected.value.panel,
          }
        }),
        expected = {
          tab: 1,
          panel: 1,
        }

  await page.evaluate(() => (window as unknown as WithGlobals).testState.cleanup())

  assert.equal(value, expected)
})

suite.run()
