import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useCheckbox')
)

suite(`checked state updates reactively`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCheckbox/withoutOptions')
  await page.waitForSelector('input', { state: 'attached' })

  await page.click('input')
  const value = await page.evaluate(() => window.testState.checkbox.checked.value)
  assert.is(value, true)
})

suite(`respects initial checked`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCheckbox/withOptions')
  await page.waitForSelector('input', { state: 'attached' })

  const value = await page.evaluate(() => window.testState.checkbox.checked.value)
  assert.is(value, true)
})

suite(`toggle() toggles checkbox`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCheckbox/withoutOptions')
  await page.waitForSelector('input', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.checkbox.toggle();

          await window.nextTick();

          return window.testState.checkbox.checked.value
        }),
        expected = true
  
  assert.is(value, expected)
})

suite(`check() checks checkbox`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCheckbox/withoutOptions')
  await page.waitForSelector('input', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.checkbox.check();

          await window.nextTick();

          return window.testState.checkbox.checked.value
        }),
        expected = true
  
  assert.is(value, expected)
})

suite(`uncheck() checks checkbox`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useCheckbox/withOptions')
  await page.waitForSelector('input', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.checkbox.uncheck();

          await window.nextTick();

          return window.testState.checkbox.checked.value
        }),
        expected = false
  
  assert.is(value, expected)
})

suite.run()
