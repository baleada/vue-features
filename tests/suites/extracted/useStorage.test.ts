import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useStorage')
)

suite('performs initial effect', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useStorage')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.initialProof.value
        }),
        expected = 1

  assert.is(value, expected)
})

suite('stores', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useStorage')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          const value = window.testState.storeable.status
          window.testState.cleanup()
          return value
        }),
        expected = 'stored'

  assert.is(value, expected)
})

suite('stores the getString return value', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useStorage')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          const value = window.testState.storeable.string
          window.testState.cleanup()
          return value
        }),
        expected = 'Baleada'

  assert.is(value, expected)
})

suite('collects watch sources from getString', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useStorage')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.string.value = 'Baleada: a toolkit for building web apps'
          await window.nextTick()
          const value = window.testState.storeable.string
          window.testState.cleanup()
          return value
        }),
        expected = 'Baleada: a toolkit for building web apps'

  assert.is(value, expected)
})



suite.run()
