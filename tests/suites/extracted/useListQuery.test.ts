import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useListQuery')
)

suite('search(...) searches candidates, falling back to textContent', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useListQuery')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.listQuery.type('e')
          window.testState.listQuery.search()
          return window.testState.listQuery.results.value.filter(({ score }) => score > 0).length
        }),
        expected = 2

  assert.is(value, expected)
})

// TODO: test type and search

suite.run()
