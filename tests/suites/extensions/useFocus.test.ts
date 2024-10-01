import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useFocus')
)

suite('sets status to focused', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useFocus/withUrlOptions')
  await page.waitForSelector('input', { state: 'attached' })

  await page.focus('input')
  const status = await page.evaluate(async () => window.testState.inputFocus.status.value),
        expected = 'focused'

  assert.is(status, expected)
})

suite('sets status to blurred', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useFocus/withUrlOptions')
  await page.waitForSelector('input', { state: 'attached' })

  await page.focus('input')
  await page.keyboard.press('Tab')
  const status = await page.evaluate(async () => window.testState.inputFocus.status.value),
        expected = 'blurred'

  assert.is(status, expected)
})

suite('when element is target of focus, sets target to element', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useFocus/withUrlOptions')
  await page.waitForSelector('input', { state: 'attached' })

  await page.focus('input')
  const target = await page.evaluate(async () => window.testState.inputFocus.target.value),
        expected = 'element'

  assert.is(target, expected)
})

suite('when descendant is target of focus, sets target to descendant', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useFocus/withUrlOptions')
  await page.waitForSelector('input', { state: 'attached' })

  await page.focus('div>input')
  const target = await page.evaluate(async () => window.testState.divFocus.target.value),
        expected = 'descendant'

  assert.is(target, expected)
})

suite('when neither element nor its descendants are focused, sets target to n/a', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useFocus/withUrlOptions')
  await page.waitForSelector('input', { state: 'attached' })

  const target = await page.evaluate(async () => window.testState.inputFocus.target.value),
        expected = 'n/a'

  assert.is(target, expected)
})

suite('when focus is visible, sets visibility to visible', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useFocus/withUrlOptions')
  await page.waitForSelector('input', { state: 'attached' })

  await page.focus('input')
  const visibility = await page.evaluate(async () => window.testState.inputFocus.visibility.value),
        expected = 'visible'

  assert.is(visibility, expected)
})

suite('when focus is invisible, sets visibility to invisible', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useFocus/withUrlOptions')
  await page.waitForSelector('input', { state: 'attached' })

  const { top, left } = await page.evaluate(() => document.querySelector('button').getBoundingClientRect())
  await page.mouse.click(left, top)
  const visibility = await page.evaluate(async () => window.testState.buttonFocus.visibility.value),
        expected = 'invisible'

  assert.is(visibility, expected)
})

suite('when neither element nor its descendants are focused, sets visibility to n/a', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useFocus/withUrlOptions')
  await page.waitForSelector('input', { state: 'attached' })

  const visibility = await page.evaluate(async () => window.testState.inputFocus.visibility.value),
        expected = 'n/a'

  assert.is(visibility, expected)
})

suite.run()
