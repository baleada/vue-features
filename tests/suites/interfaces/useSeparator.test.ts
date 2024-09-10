import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useSeparator')
)

suite('binds role', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/static')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.separator.root.element.value.getAttribute('role')),
        expected = 'separator'

  assert.is(value, expected)
})

suite('binds aria orientation', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/static')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.separator.root.element.value.getAttribute('aria-orientation')),
        expected = 'horizontal'

  assert.is(value, expected)
})

suite('respects orientation option', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/staticWithOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.separator.root.element.value.getAttribute('aria-orientation')),
        expected = 'vertical'

  assert.is(value, expected)
})

suite('variable binds tabindex', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variable')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.separator.root.element.value.getAttribute('tabindex')),
        expected = '0'

  assert.is(value, expected)
})

suite('<non-static> binds aria controls', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variable')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.separator.root.element.value.getAttribute('aria-controls'))

  assert.ok(value.length)
})

suite('<non-static>.position stores position', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variable')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.separator.position.value),
        expected = 50

  assert.is(value, expected)
})

suite('<non-static> respects initialPosition option', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variableWithOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.separator.position.value),
        expected = 42

  assert.is(value, expected)
})

suite('<non-static>.exact(...) sets position', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variable')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.separator.exact(25)),
        expected = 25

  assert.is(value, expected)
})

suite('<non-static>.toggle(...) toggles position to min', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variable')
  await page.waitForSelector('div', { state: 'attached' })
  await page.evaluate(async () => window.testState.separator.toggle())

  const value = await page.evaluate(async () => window.testState.separator.position.value),
        expected = 0

  assert.is(value, expected)
})

suite('<non-static>.toggle(...) toggles position back from min', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variable')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.separator.toggle()
          return window.testState.separator.toggle()
        }),
        expected = 50

  assert.is(value, expected)
})

suite('<non-static> binds aria-valuenow', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variable')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.separator.root.element.value.getAttribute('aria-valuenow')),
        expected = '50'

  assert.is(value, expected)
})

suite('<non-static> binds aria-valuemin', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variable')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.separator.root.element.value.getAttribute('aria-valuemin')),
        expected = '0'

  assert.is(value, expected)
})

suite('<non-static> binds aria-valuemax', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variable')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.separator.root.element.value.getAttribute('aria-valuemax')),
        expected = '100'

  assert.is(value, expected)
})

suite('<non-static> respects min option', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variableWithOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.separator.root.element.value.getAttribute('aria-valuemin')),
        expected = '10'

  assert.is(value, expected)
})

suite('<non-static> respects max option', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variableWithOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => window.testState.separator.root.element.value.getAttribute('aria-valuemax')),
        expected = '69'

  assert.is(value, expected)
})

suite('<non-static> toggles on enter keydown', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variable')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.separator.root.element.value.focus())
  await page.keyboard.press('Enter')

  const value = await page.evaluate(async () => window.testState.separator.position.value),
        expected = 0

  assert.is(value, expected)
})

suite('variable.increase(...) increases position by step', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variable')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.separator.increase())

  const value = await page.evaluate(async () => window.testState.separator.position.value),
        expected = 51

  assert.is(value, expected)
})

suite('variable.decrease(...) decreases position by step', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variable')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.separator.decrease())

  const value = await page.evaluate(async () => window.testState.separator.position.value),
        expected = 49

  assert.is(value, expected)
})

suite('variable respects step option', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variableWithOptions')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.separator.increase())

  const value = await page.evaluate(async () => window.testState.separator.position.value),
        expected = 47

  assert.is(value, expected)
})

suite('variable horizontal decreases on left keydown', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variable')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.separator.root.element.value.focus())
  await page.keyboard.press('ArrowLeft')

  const value = await page.evaluate(async () => window.testState.separator.position.value),
        expected = 49

  assert.is(value, expected)
})

suite('variable horizontal increases on right keydown', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variable')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.separator.root.element.value.focus())
  await page.keyboard.press('ArrowRight')

  const value = await page.evaluate(async () => window.testState.separator.position.value),
        expected = 51

  assert.is(value, expected)
})

suite('variable vertical decreases on up keydown', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variableWithOptions')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.separator.root.element.value.focus())
  await page.keyboard.press('ArrowUp')

  const value = await page.evaluate(async () => window.testState.separator.position.value),
        expected = 37

  assert.is(value, expected)
})

suite('variable vertical increases on down keydown', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useSeparator/variableWithOptions')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.separator.root.element.value.focus())
  await page.keyboard.press('ArrowDown')

  const value = await page.evaluate(async () => window.testState.separator.position.value),
        expected = 47

  assert.is(value, expected)
})

suite.run()
