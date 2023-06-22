import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useErrorMessage')
)

suite(`assigns to textbox's aria-describedby`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useErrorMessage')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          return window.testState.textbox.root.element.value.getAttribute('aria-describedby')
        })

  assert.ok(value)
})

suite(`conditionally displays error message`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useErrorMessage')
  await page.waitForSelector('span')
  
  const from = await page.evaluate(async () => {
          return window.getComputedStyle(
            window.testState.errorMessage.root.element.value
          ).display
        })

  assert.is(from, 'none')
  
  const to = await page.evaluate(async () => {
          window.testState.textbox.type('0')
          await window.nextTick()
          return window.getComputedStyle(
            window.testState.errorMessage.root.element.value
          ).display
        })

  assert.is(to, 'inline')
})

suite.run()
