import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useWithListFocus')
)

suite('tracks statuses', async ({ playwright: { page, tab } }) => {
  await page.goto('http://localhost:5173/useWithListFocus/test')
  await page.waitForSelector('div', { state: 'attached' })

  await page.click('body')

  const value = await page.evaluate(() => [...window.testState.focusTrackings.statuses.value]),
        expected = new Array(3).fill('blurred')

  assert.equal(value, expected)

  for (const num of [0, 1, 2]) {
    await tab({ direction: 'forward', total: 1 })
    const value = await page.evaluate(() => [...window.testState.focusTrackings.statuses.value]),
          expected = new Array(3).fill('blurred')

    expected[num] = 'focused'

    assert.equal(value, expected)
  }
})

suite.run()
