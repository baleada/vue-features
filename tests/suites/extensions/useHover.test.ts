import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useHover')
)

suite('sets status to hovered', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHover/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const { top, left } = await page.evaluate(() => window.testState.api.element.value.getBoundingClientRect())

  await page.mouse.move(left, top)

  const value = await page.evaluate(async () => window.testState.hover.status.value),
        expected = 'hovered'

  assert.is(value, expected)
})

suite('sets status to exited', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHover/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const { top, left } = await page.evaluate(() => window.testState.api.element.value.getBoundingClientRect())

  await page.mouse.move(left, top)
  await page.mouse.move(left - 1, top)

  const value = await page.evaluate(async () => window.testState.hover.status.value),
        expected = 'exited'

  assert.is(value, expected)
})

suite('sets descriptor', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHover/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const { top, left } = await page.evaluate(() => window.testState.api.element.value.getBoundingClientRect())

  await page.mouse.move(left, top)

  const value = await page.evaluate(async () => !!window.testState.hover.descriptor.value),
        expected = true

  assert.is(value, expected)
})

suite('sets first press', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHover/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const { top, left } = await page.evaluate(() => window.testState.api.element.value.getBoundingClientRect())

  await page.mouse.move(left, top)
  await page.waitForTimeout(50)

  const value = await page.evaluate(async () => (
          window.testState.hover.firstDescriptor.value.sequence.length === 1
          && window.testState.hover.firstDescriptor.value.sequence[0] === window.testState.hover.descriptor.value.sequence[0]
          && window.testState.hover.firstDescriptor.value !== window.testState.hover.descriptor.value
        )),
        expected = true

  assert.is(value, expected)
})

suite.run()
