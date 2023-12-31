import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useConditionalRendering')
)

suite('respects initialRenders', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useConditionalRendering/withOptions')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => window.testState.el.value),
        expected = null

  assert.is(value, expected)
})

suite('render(...) updates status', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useConditionalRendering/withOptions')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
          window.testState.rendering.render()
          await window.nextTick()
          return window.testState.rendering.status.value
        }),
        expected = 'rendered'

  assert.is(value, expected)
})

suite('remove(...) updates status', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useConditionalRendering')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
          window.testState.rendering.remove()
          await window.nextTick()
          return window.testState.rendering.status.value
        }),
        expected = 'removed'

  assert.is(value, expected)
})

suite('toggle(...) updates status', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useConditionalRendering')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
          window.testState.rendering.toggle()
          await window.nextTick()
          return window.testState.rendering.status.value
        }),
        expected = 'removed'

  assert.is(value, expected)
})

suite.run()
