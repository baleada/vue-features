import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../fixtures/types'

const suite = withPuppeteer(
  createSuite('useInput'),
)

// Was getting weird 

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

suite(`sets completeable.selection as textbox selection`, async ({ puppeteer: { browser } }) => {
  const page = await browser.newPage()
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

suite(`sets completeable.selection on select`, async ({ puppeteer: { browser } }) => {
  const page = await browser.newPage()
  await page.goto('http://localhost:3000/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.textbox.completeable.string = 'Baleada')

  await page.click('input')

  await page.evaluate(async () => await (window as unknown as WithGlobals).nextTick())

  await page.keyboard.down('Meta')
  await page.keyboard.down('A')

  await page.evaluate(async () => await (window as unknown as WithGlobals).nextTick())

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

suite(`sets completeable.selection on focus`, async ({ puppeteer: { browser } }) => {
  const page = await browser.newPage()
  await page.goto('http://localhost:3000/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.textbox.completeable.string = 'Baleada')

  await page.click('input')

  await page.evaluate(async () => await (window as unknown as WithGlobals).nextTick())

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

suite(`sets completeable.selection on mouseup`, async ({ puppeteer: { browser } }) => {
  const page = await browser.newPage()
  await page.goto('http://localhost:3000/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.textbox.completeable.string = 'Baleada')
  
  // Focus to set full selection
  await page.focus('input')

  await page.evaluate(async () => await (window as unknown as WithGlobals).nextTick())

  const { y, right } = await page.evaluate(() => {
    const rect = document.querySelector('input').getBoundingClientRect()

    return {
      y: rect.y,
      right: rect.right,
    }
  })
  
  // Click again to narrow selection
  await page.mouse.move(right - 5, y + 5)
  await page.mouse.down()
  // Don't need two mouse ups in real life, but browser emulators appear
  // to need it
  await page.mouse.up()
  await page.mouse.up()
  

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

suite(`sets completeable.selection on shift+arrow`, async ({ puppeteer: { browser } }) => {
  const page = await browser.newPage()
  await page.goto('http://localhost:3000/useTextbox/withoutOptions')
  await page.waitForSelector('input')
  
  await page.evaluate(() => (window as unknown as WithGlobals).testState.textbox.completeable.string = 'Baleada')
  
  await page.focus('input')
  await page.keyboard.down('ArrowLeft')
  await page.keyboard.up('ArrowLeft')
  
  await page.evaluate(async () => await (window as unknown as WithGlobals).nextTick())
  
  await page.keyboard.down('Shift')
  await page.keyboard.press('ArrowRight')
  
  const value = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()
          return {
            start: (window as unknown as WithGlobals).testState.textbox.completeable.selection.start,
            end: (window as unknown as WithGlobals).testState.textbox.completeable.selection.end,
            direction: (window as unknown as WithGlobals).testState.textbox.completeable.selection.direction,
          }
        }),
        expected = {
          start: 0,
          end: 1,
          direction: 'forward',
        }

  assert.equal(value, expected)
})

suite(`sets completeable.selection on cmd+arrow`, async ({ puppeteer: { browser } }) => {
  const page = await browser.newPage()
  await page.goto('http://localhost:3000/useTextbox/withoutOptions')
  await page.waitForSelector('input')
  
  await page.evaluate(() => (window as unknown as WithGlobals).testState.textbox.completeable.string = 'Baleada')
  
  await page.focus('input')
  await page.keyboard.down('ArrowLeft')
  await page.keyboard.up('ArrowLeft')
  
  await page.evaluate(async () => await (window as unknown as WithGlobals).nextTick())
  
  await page.keyboard.down('Meta')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.up('Meta')
  
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
          direction: 'forward',
        }

  assert.equal(value, expected)
})

// 'cmd+arrow'
// '+cmd'
// '+ctrl'
// 'cmd+z'
// 'cmd+y'
// 'ctrl+z'
// 'ctrl+y'

suite.run()
