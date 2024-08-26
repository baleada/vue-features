import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('delegatePress')
)

suite('delegates press', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useWithPress/mountingDelegate')
  await page.waitForSelector('button', { state: 'attached' })

  await page.evaluate(() => window.testState.child.element.value.focus())

  await page.keyboard.down('Enter')

  const value = await page.evaluate(async () => window.testState.child.count.value),
        expected = 1

  await page.keyboard.up('Enter')

  assert.is(value, expected)
})

suite('delegates press when conditionally rendering component with it\'s own mount hook', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useWithPress/mountingDelegate')
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
  await page.goto('http://localhost:5173/useWithPress/conditionalRenderingDelegate')
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

suite.run()
