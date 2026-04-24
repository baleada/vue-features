import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import {
  withPlaywrightOptions,
} from '../../fixtures/withPlaywrightOptions'

const suite = withPlaywright(
  createSuite('delegateFocus'),
  withPlaywrightOptions
)

suite('delegates focus', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useFocus/mountingDelegate')
  await page.waitForSelector('button', { state: 'attached' })

  await page.evaluate(() => window.testState.child.element.value.focus())

  const value = await page.evaluate(async () => window.testState.child.focus.status.value),
        expected = 'focused'

  assert.is(value, expected)
})

suite('delegates blur', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useFocus/mountingDelegate')
  await page.waitForSelector('button', { state: 'attached' })

  await page.evaluate(() => window.testState.child.element.value.focus())
  await page.evaluate(() => window.testState.child.element.value.blur())

  const value = await page.evaluate(async () => window.testState.child.focus.status.value),
        expected = 'blurred'

  assert.is(value, expected)
})

suite('delegates focus when conditionally rendering component with its own mount hook', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useFocus/mountingDelegate')
  await page.waitForSelector('button', { state: 'attached' })

  await page.evaluate(() => window.testState.child.mountGrandchild.value = true)
  await page.waitForSelector('button:last-of-type', { state: 'attached' })

  await page.evaluate(() => window.testState.grandchild.element.value.focus())

  const value = await page.evaluate(async () => window.testState.grandchild.focus.status.value),
        expected = 'focused'

  assert.is(value, expected)
})

suite('delegates focus when conditionally rendering element', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useFocus/conditionalDelegate')
  await page.waitForSelector('button', { state: 'attached' })

  await page.evaluate(() => window.testState.renderTwo.value = true)
  await page.waitForSelector('button:last-of-type', { state: 'attached' })

  await page.evaluate(() => window.testState.two.element.value.focus())

  const value = await page.evaluate(async () => window.testState.two.focus.status.value),
        expected = 'focused'

  assert.is(value, expected)
})

suite('delegates focus to ancestor as focus-within when descendant is focused', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useFocus/delegate-nested')
  await page.waitForSelector('input', { state: 'attached' })

  await page.focus('input')

  const value = await page.evaluate(async () => [
          window.testState.outerFocus.status.value,
          window.testState.outerFocus.target.value,
          window.testState.innerFocus.status.value,
          window.testState.innerFocus.target.value,
        ]),
        expected = ['blurred', 'descendant', 'focused', 'element']

  assert.equal(value, expected)
})

suite('stops delegating focus after element is unmounted', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useFocus/conditionalDelegate')
  await page.waitForSelector('button', { state: 'attached' })

  await page.evaluate(() => window.testState.renderTwo.value = true)
  await page.waitForSelector('button:last-of-type', { state: 'attached' })

  await page.evaluate(() => window.testState.two.element.value.focus())

  {
    const value = await page.evaluate(async () => window.testState.two.focus.status.value),
          expected = 'focused'

    assert.is(value, expected)
  }

  await page.evaluate(() => window.testState.two.element.value.blur())
  await page.evaluate(() => window.testState.renderTwo.value = false)

  const value = await page.evaluate(async () => window.testState.two.focus.status.value),
        expected = 'blurred'

  assert.is(value, expected)
})

suite.run()
