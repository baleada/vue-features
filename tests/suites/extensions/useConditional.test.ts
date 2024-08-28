import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useConditional')
)

suite('respects initialRenders', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useConditional/withOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.el.value),
        expected = null

  assert.is(value, expected)
})

suite('render(...) updates status', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useConditional/withOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.conditional.render()
          await window.nextTick()
          return window.testState.conditional.status.value
        }),
        expected = 'rendered'

  assert.is(value, expected)
})

suite('remove(...) updates status', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useConditional')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.conditional.remove()
          await window.nextTick()
          return window.testState.conditional.status.value
        }),
        expected = 'removed'

  assert.is(value, expected)
})

suite('toggle(...) updates status', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useConditional')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.conditional.toggle()
          await window.nextTick()
          return window.testState.conditional.status.value
        }),
        expected = 'removed'

  assert.is(value, expected)
})

suite.run()
