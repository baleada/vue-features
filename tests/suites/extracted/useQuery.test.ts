import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useQuery')
)

suite('paste(...) sets the query', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useQuery')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.query.paste('baleada')
          return window.testState.query.query.value
        }),
        expected = 'baleada'

  assert.is(value, expected)
})

suite('paste(...) eventually clears the query', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useQuery')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.query.paste('baleada')
          await new Promise(resolve => setTimeout(resolve, 600))
          return window.testState.query.query.value
        }),
        expected = ''

  assert.is(value, expected)
})

suite('paste(...) respects eventuallyClears option', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useQuery')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.query.paste('baleada', { eventuallyClears: false })
          await new Promise(resolve => setTimeout(resolve, 600))
          return window.testState.query.query.value
        }),
        expected = 'baleada'

  assert.is(value, expected)
})

suite('type(...) adds to query', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useQuery')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.query.paste('baleada')
          window.testState.query.type('s')
          return window.testState.query.query.value
        }),
        expected = 'baleadas'

  assert.is(value, expected)
})

suite.run()
