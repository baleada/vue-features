import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('delegatePress')
)

suite('delegates hover', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHover/mountingDelegate')
  await page.waitForSelector('button', { state: 'attached' })

  const { top, left } = await page.evaluate(() => document.querySelector('button').getBoundingClientRect())

  await page.mouse.move(left, top)

  const value = await page.evaluate(async () => window.testState.child.count.value),
        expected = 1

  assert.is(value, expected)
})

suite('delegates hover when conditionally rendering component with its own mount hook', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHover/mountingDelegate')
  await page.waitForSelector('button', { state: 'attached' })

  await page.evaluate(() => window.testState.child.mountGrandchild.value = true)
  const { top, left } = await page.evaluate(() => document.querySelector('button:last-of-type').getBoundingClientRect())

  await page.mouse.move(left, top)

  const value = await page.evaluate(async () => window.testState.grandchild.count.value),
        expected = 1

  assert.is(value, expected)
})

suite('delegates hover when conditionally rendering element', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHover/conditionalDelegate')
  await page.waitForSelector('button', { state: 'attached' })

  await page.evaluate(() => window.testState.renderTwo.value = true)
  const { top, left } = await page.evaluate(() => document.querySelector('button:last-of-type').getBoundingClientRect())

  await page.mouse.move(left + 1, top + 1)

  const value = await page.evaluate(async () => window.testState.two.count.value),
        expected = 1

  assert.is(value, expected)
})

suite('delegates hover for nested elements and their ancestors, preferring elements at the topmost painted layar', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHover/delegate-nested')
  await page.waitForSelector('div', { state: 'attached' })

  const { top, left } = await page.evaluate(() => window.testState.top.api1.element.value.getBoundingClientRect())

  await page.mouse.move(left, top)

  const value = await page.evaluate(async () => [
          window.testState.top.count1.value,
          window.testState.top.count2.value,
          window.testState.bottom.count1.value,
          window.testState.bottom.count2.value,
        ]),
        expected = [1, 1, 0, 0]

  assert.equal(value, expected)
})

suite.run()
