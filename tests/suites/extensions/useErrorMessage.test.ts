import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useErrorMessage')
)

suite(`assigns to textbox's aria-errormessage`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useErrorMessage')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          return (window as unknown as WithGlobals).testState.textbox.root.element.value.getAttribute('aria-errormessage')
        })

  assert.ok(value)
})

suite(`binds aria-invalid`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useErrorMessage')
  await page.waitForSelector('span')
  
  const from = await page.evaluate(async () => {
          return (window as unknown as WithGlobals).testState.textbox.root.element.value.getAttribute('aria-invalid')
        })

  assert.not.ok(from)
  
  const to = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.type('0')
          await (window as unknown as WithGlobals).nextTick()
          return (window as unknown as WithGlobals).testState.textbox.root.element.value.getAttribute('aria-invalid')
        })

  assert.is(to, 'true')
})

suite(`conditionally displays error message`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useErrorMessage')
  await page.waitForSelector('span')
  
  const from = await page.evaluate(async () => {
          return window.getComputedStyle(
            (window as unknown as WithGlobals).testState.errorMessage.root.element.value
          ).display
        })

  assert.is(from, 'none')
  
  const to = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.type('0')
          await (window as unknown as WithGlobals).nextTick()
          return window.getComputedStyle(
            (window as unknown as WithGlobals).testState.errorMessage.root.element.value
          ).display
        })

  assert.is(to, 'inline')
})

suite.run()
