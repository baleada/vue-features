import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('delegateHover')
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

suite('delegates onOut to element that is covered up by element without hover after hover starts', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHover/delegate-popup')
  await page.waitForSelector('div', { state: 'attached' })

  const { top, left } = await page.evaluate(() => window.testState.api1.element.value.getBoundingClientRect())

  await page.mouse.move(left, top)

  // // Playwright doesn't fire `pointerout` when the popup appears on top of the hovered element,
  // // but moving the mouse 1px is enough to test delegation logic.
  // await page.mouse.move(left + 1, top)

  const value = await page.evaluate(async () => window.testState.count1.value > 0 && window.testState.hover1.status.value),
        expected = 'exited'

  assert.is(value, expected)
})

suite('delegates onOut to element that is covered up by element with hover after hover starts', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useHover/delegate-popup-with-hover')
  await page.waitForSelector('div', { state: 'attached' })

  const { top, left } = await page.evaluate(() => window.testState.api1.element.value.getBoundingClientRect())

  await page.mouse.move(left, top)

  // // Playwright doesn't fire `pointerout` when the popup appears on top of the hovered element,
  // // but moving the mouse 1px is enough to test delegation logic.
  // await page.mouse.move(left + 1, top)

  const value = await page.evaluate(async () => window.testState.count1.value > 0 && window.testState.hover1.status.value),
        expected = 'exited'

  assert.is(value, expected)
})

suite.run()
