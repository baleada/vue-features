import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../fixtures/types'

const suite = withPuppeteer(
  createSuite('useInput')
)

suite(`assigns aria-invalid`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  const value = await page.evaluate(async () => {
          return (window as unknown as WithGlobals).testState.textbox.root.element.getAttribute('aria-invalid')
        }),
        expected = 'false'

  assert.is(value, expected)
})

suite(`binds completeable.string to textbox value`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTextbox/withoutOptions')
  await page.waitForSelector('input')
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.completeable.string = 'Baleada';
          await (window as unknown as WithGlobals).nextTick()
          return (window as unknown as WithGlobals).testState.textbox.root.element.value
        }),
        expected = 'Baleada'

  assert.is(value, expected)
})

suite(`sets completeable.selection as textbox selection`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTextbox/withoutOptions')
  await page.waitForSelector('input')
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.completeable.string = 'Baleada';
          (window as unknown as WithGlobals).testState.textbox.completeable.selection = {
            start: 0,
            end: 'Baleada'.length,
            direction: 'forward',
          }

          await (window as unknown as WithGlobals).nextTick()

          return {
            start: (window as unknown as WithGlobals).testState.textbox.root.element.selectionStart,
            end: (window as unknown as WithGlobals).testState.textbox.root.element.selectionEnd,
            direction: (window as unknown as WithGlobals).testState.textbox.root.element.selectionDirection,
          }
        }),
        expected = {
          start: 0,
          end: 'Baleada'.length,
          direction: 'forward',
        }

  assert.equal(value, expected)
})

// 'input'

suite(`sets completeable.selection on select`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.textbox.completeable.string = 'Baleada')

  await page.click('input')
  await page.click('input')
  await page.keyboard.down('Meta')
  await page.keyboard.down('A')

  const value = await page.evaluate(async () => {
          return {
            start: (window as unknown as WithGlobals).testState.textbox.completeable.selection.start,
            end: (window as unknown as WithGlobals).testState.textbox.completeable.selection.end,
            direction: (window as unknown as WithGlobals).testState.textbox.completeable.selection.direction,
          }
        }),
        expected = {
          start: 0,
          end: 'Baleada'.length,
          direction: 'forward',
        }

  assert.equal(value, expected)
})

suite(`sets completeable.selection on focus`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.textbox.completeable.string = 'Baleada')

  await page.click('input')

  const value = await page.evaluate(async () => {
          return {
            start: (window as unknown as WithGlobals).testState.textbox.completeable.selection.start,
            end: (window as unknown as WithGlobals).testState.textbox.completeable.selection.end,
            direction: (window as unknown as WithGlobals).testState.textbox.completeable.selection.direction,
          }
        }),
        expected = {
          start: 0,
          end: 'Baleada'.length,
          direction: 'forward',
        }

  assert.equal(value, expected)
})

suite(`sets completeable.selection on mouseup`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.textbox.completeable.string = 'Baleada')
  const { y, right } = await page.evaluate(() => {
    const rect = document.querySelector('input').getBoundingClientRect()

    return {
      y: rect.y,
      right: rect.right,
    }
  })
  
  // Focus to set full selection
  await page.focus('input')
  await page.mouse.click(right - 10, y + 5)
  // Click again to narrow selection
  await page.mouse.click(right - 10, y + 5)
  await page.waitForTimeout(20)

  const value = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()
          return {
            start: (window as unknown as WithGlobals).testState.textbox.completeable.selection.start,
            end: (window as unknown as WithGlobals).testState.textbox.completeable.selection.end,
            direction: (window as unknown as WithGlobals).testState.textbox.completeable.selection.direction,
          }
        }),
        expected = {
          start: 'Baleada'.length,
          end: 'Baleada'.length,
          direction: 'none',
        }

  assert.equal(value, expected)
})

// '+arrow'
// '+cmd'
// '+ctrl'
// 'cmd+z'
// 'cmd+y'
// 'ctrl+z'
// 'ctrl+y'

suite.run()
