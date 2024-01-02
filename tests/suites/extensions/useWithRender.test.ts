import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useWithRender')
)

suite('respects initialRenders', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useWithRender/withOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.el.value),
        expected = null

  assert.is(value, expected)
})

suite('render(...) updates status', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useWithRender/withOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.withRender.render()
          await window.nextTick()
          return window.testState.withRender.status.value
        }),
        expected = 'rendered'

  assert.is(value, expected)
})

suite('remove(...) updates status', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useWithRender')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.withRender.remove()
          await window.nextTick()
          return window.testState.withRender.status.value
        }),
        expected = 'removed'

  assert.is(value, expected)
})

suite('toggle(...) updates status', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useWithRender')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.withRender.toggle()
          await window.nextTick()
          return window.testState.withRender.status.value
        }),
        expected = 'removed'

  assert.is(value, expected)
})

suite.run()
