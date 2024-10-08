import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('delegatePress')
)

suite('delegates press', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/mountingDelegate')
  await page.waitForSelector('button', { state: 'attached' })

  await page.evaluate(() => window.testState.child.element.value.focus())

  await page.keyboard.down('Enter')

  const value = await page.evaluate(async () => window.testState.child.count.value),
        expected = 1

  await page.keyboard.up('Enter')

  assert.is(value, expected)
})

suite('delegates press when conditionally rendering component with its own mount hook', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/mountingDelegate')
  await page.waitForSelector('button', { state: 'attached' })

  await page.evaluate(() => window.testState.child.element.value.focus())

  await page.keyboard.down('Enter')
  await page.keyboard.up('Enter')

  await page.evaluate(() => window.testState.grandchild.element.value.focus())
  await page.keyboard.down('Enter')

  const value = await page.evaluate(async () => window.testState.grandchild.count.value),
        expected = 1

  await page.keyboard.up('Enter')

  assert.is(value, expected)
})

suite('delegates press when conditionally rendering element', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/conditionalDelegate')
  await page.waitForSelector('button', { state: 'attached' })

  await page.evaluate(() => window.testState.one.element.value.focus())

  await page.keyboard.down('Enter')
  await page.keyboard.up('Enter')

  await page.evaluate(() => window.testState.two.element.value.focus())
  await page.keyboard.down('Enter')

  const value = await page.evaluate(async () => window.testState.two.count.value),
        expected = 1

  await page.keyboard.up('Enter')

  assert.is(value, expected)
})

suite('delegates hover for nested elements and their ancestors, preferring elements at the topmost painted layar', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/delegate-nested')
  await page.waitForSelector('div', { state: 'attached' })

  const { top, left } = await page.evaluate(() => window.testState.top.api1.element.value.getBoundingClientRect())

  await page.mouse.move(left, top)
  await page.mouse.down()
  await page.mouse.up()

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
