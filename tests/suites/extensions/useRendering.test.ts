import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useRendering')
)

suite('respects initialRenders', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useRendering/withOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.el.value),
        expected = null

  assert.is(value, expected)
})

suite('render(...) updates status', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useRendering/withOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.rendering.render()
          await window.nextTick()
          return window.testState.rendering.status.value
        }),
        expected = 'rendered'

  assert.is(value, expected)
})

suite('remove(...) updates status', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useRendering')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.rendering.remove()
          await window.nextTick()
          return window.testState.rendering.status.value
        }),
        expected = 'removed'

  assert.is(value, expected)
})

suite('toggle(...) updates status', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useRendering')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.rendering.toggle()
          await window.nextTick()
          return window.testState.rendering.status.value
        }),
        expected = 'removed'

  assert.is(value, expected)
})

suite.run()
