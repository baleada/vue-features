import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useStorage')
)

suite('performs initial effect', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useStorage')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return window.testState.initialProof.value
        }),
        expected = 1

  assert.is(value, expected)
})

suite('stores', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useStorage')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          const value = window.testState.storeable.status
          window.testState.cleanup()
          return value
        }),
        expected = 'stored'

  assert.is(value, expected)
})

suite('stores the getString return value', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useStorage')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          const value = window.testState.storeable.string
          window.testState.cleanup()
          return value
        }),
        expected = 'Baleada'

  assert.is(value, expected)
})

suite('collects watch sources from getString', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useStorage')
  await page.waitForSelector('span')

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
