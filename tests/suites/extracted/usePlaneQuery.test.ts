import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('usePlaneQuery')
)

suite('search(...) searches candidates, falling back to textContent', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePlaneQuery')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.planeQuery.type('e')
          window.testState.planeQuery.search()
          return window.testState.planeQuery.results.value.map(row => row.filter(({ score }) => score > 0).length)
        }),
        expected = [1, 3, 0]

  assert.equal(value, expected)
})

// TODO: test type and search

suite.run()
