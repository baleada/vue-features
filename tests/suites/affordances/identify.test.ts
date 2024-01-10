import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('identify')
)

suite('identifies element', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/identify/element')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(() => window.testState.id.value)

  // Generated nanoid has 8 characters
  assert.ok(value.length === 8)
})

suite('respects existing IDs', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/identify/elementWithId')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(() => window.testState.id.value),
        expected = 'stub'

  assert.is(value, expected)
})

suite('identifies list', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/identify/list')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => [...window.testState.ids.value])

  assert.ok(value.every(id => id.length === 8))
})

suite('identifies plane', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/identify/plane')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.ids.value.map(row => [...row]))

  assert.ok(value.every(row => row.every(id => id.length === 8)))
})

suite.run()