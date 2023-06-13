import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useCheckbox')
)

suite(`checked state updates reactively`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useCheckbox/withoutOptions')
  await page.waitForSelector('input')

  await page.click('input')
  const value = await page.evaluate(() => window.testState.checkbox.checked.value)
  assert.is(value, true)
})

suite(`respects initial checked`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useCheckbox/withOptions')
  await page.waitForSelector('input')

  const value = await page.evaluate(() => window.testState.checkbox.checked.value)
  assert.is(value, true)
})

suite(`toggle() toggles checkbox`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useCheckbox/withoutOptions')
  await page.waitForSelector('input')

  const value = await page.evaluate(async () => {
          window.testState.checkbox.toggle();

          await window.nextTick();

          return window.testState.checkbox.checked.value
        }),
        expected = true
  
  assert.is(value, expected)
})

suite(`check() checks checkbox`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useCheckbox/withoutOptions')
  await page.waitForSelector('input')

  const value = await page.evaluate(async () => {
          window.testState.checkbox.check();

          await window.nextTick();

          return window.testState.checkbox.checked.value
        }),
        expected = true
  
  assert.is(value, expected)
})

suite(`uncheck() checks checkbox`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useCheckbox/withOptions')
  await page.waitForSelector('input')

  const value = await page.evaluate(async () => {
          window.testState.checkbox.uncheck();

          await window.nextTick();

          return window.testState.checkbox.checked.value
        }),
        expected = false
  
  assert.is(value, expected)
})

suite.run()
