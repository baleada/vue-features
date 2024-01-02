import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useWithRender')
)

suite('respects initialRenders', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useWithRender/withOptions')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => window.testState.el.value),
        expected = null

  assert.is(value, expected)
})

suite('render(...) updates status', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useWithRender/withOptions')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
          window.testState.withRender.render()
          await window.nextTick()
          return window.testState.withRender.status.value
        }),
        expected = 'rendered'

  assert.is(value, expected)
})

suite('remove(...) updates status', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useWithRender')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
          window.testState.withRender.remove()
          await window.nextTick()
          return window.testState.withRender.status.value
        }),
        expected = 'removed'

  assert.is(value, expected)
})

suite('toggle(...) updates status', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useWithRender')
  await page.waitForSelector('div')

  const value = await page.evaluate(async () => {
          window.testState.withRender.toggle()
          await window.nextTick()
          return window.testState.withRender.status.value
        }),
        expected = 'removed'

  assert.is(value, expected)
})

suite.run()
