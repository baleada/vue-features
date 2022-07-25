import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useTextbox')
)

suite(`binds text.string to textbox value`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.text.string = 'Baleada';
          await (window as unknown as WithGlobals).nextTick()
          return (window as unknown as WithGlobals).testState.textbox.root.element.value
        }),
        expected = 'Baleada'

  assert.is(value, expected)
})

suite(`binds text.selection to textbox selection`, async ({ puppeteer: { browser } }) => {
  const page = await browser.newPage()
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.text.string = 'Baleada'
          ;(window as unknown as WithGlobals).testState.textbox.text.selection = {
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

suite(`updates text when history location changes`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.record({
            string: 'Baleada',
            selection: {
              start: 0,
              end: 'Baleada'.length,
              direction: 'forward',
            }
          })

          await (window as unknown as WithGlobals).nextTick()

          return {
            string: (window as unknown as WithGlobals).testState.textbox.text.string,
            selection: JSON.parse(JSON.stringify((window as unknown as WithGlobals).testState.textbox.text.selection)),
          }
        }),
        expected = {
          string: 'Baleada',
          selection: {
            start: 0,
            end: 'Baleada'.length,
            direction: 'forward',
          }
        }

  assert.equal(value, expected)
})

// Input effects and the scenarios that cause them are tested
// in more detail in the toInputEffectNames tests
suite(`can record new history on input`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.focus('input')
  await page.keyboard.type(' ')

  const value = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()
          return (window as unknown as WithGlobals).testState.textbox.history.array.length
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`can record none on input`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.focus('input')
  await page.keyboard.type('a')

  const value = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()
          return {
            historyLength: (window as unknown as WithGlobals).testState.textbox.history.array.length,
            string: (window as unknown as WithGlobals).testState.textbox.text.string,
          }
        }),
        expected = {
          historyLength: 1,
          string: 'a',
        }

  assert.equal(value, expected)
})

suite(`can record previous on input`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.focus('input')
  await page.keyboard.type('abc ')

  const value = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()
          return {
            historyLength: (window as unknown as WithGlobals).testState.textbox.history.array.length,
            string: (window as unknown as WithGlobals).testState.textbox.text.string,
          }
        }),
        expected = {
          historyLength: 3, // Previous and new were recorded in this example
          string: 'abc ',
        }

  assert.equal(value, expected)
})

suite(`can next tick record none on input`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.focus('input')
  await page.keyboard.type('abc')
  await page.keyboard.press('Backspace')

  const value = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()
          return {
            historyLength: (window as unknown as WithGlobals).testState.textbox.history.array.length,
            string: (window as unknown as WithGlobals).testState.textbox.text.string,
          }
        }),
        expected = {
          historyLength: 2,
          string: 'ab',
        }

  assert.equal(value, expected)
})

suite(`sets text.selection on select`, async ({ puppeteer: { browser } }) => {
  const page = await browser.newPage()
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.textbox.text.string = 'Baleada')

  await page.click('input')

  await page.evaluate(async () => await (window as unknown as WithGlobals).nextTick())

  await page.keyboard.down('Meta')
  await page.keyboard.down('A')

  await page.evaluate(async () => await (window as unknown as WithGlobals).nextTick())

  const value = await page.evaluate(async () => {
          return {
            start: (window as unknown as WithGlobals).testState.textbox.text.selection.start,
            end: (window as unknown as WithGlobals).testState.textbox.text.selection.end,
            direction: (window as unknown as WithGlobals).testState.textbox.text.selection.direction,
          }
        }),
        expected = {
          start: 0,
          end: 'Baleada'.length,
          direction: 'forward',
        }

  assert.equal(value, expected)
})

suite(`sets text.selection on focus`, async ({ puppeteer: { browser } }) => {
  const page = await browser.newPage()
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.textbox.text.string = 'Baleada')

  await page.click('input')

  await page.evaluate(async () => await (window as unknown as WithGlobals).nextTick())

  const value = await page.evaluate(async () => {
          return {
            start: (window as unknown as WithGlobals).testState.textbox.text.selection.start,
            end: (window as unknown as WithGlobals).testState.textbox.text.selection.end,
            direction: (window as unknown as WithGlobals).testState.textbox.text.selection.direction,
          }
        }),
        expected = {
          start: 0,
          end: 'Baleada'.length,
          direction: 'forward',
        }

  assert.equal(value, expected)
})

suite(`sets text.selection on mouseup`, async ({ puppeteer: { browser } }) => {
  const page = await browser.newPage()
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.textbox.text.string = 'Baleada')
  
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
            start: (window as unknown as WithGlobals).testState.textbox.text.selection.start,
            end: (window as unknown as WithGlobals).testState.textbox.text.selection.end,
            direction: (window as unknown as WithGlobals).testState.textbox.text.selection.direction,
          }
        }),
        expected = {
          start: 'Baleada'.length,
          end: 'Baleada'.length,
          direction: 'none',
        }

  assert.equal(value, expected)
})

suite(`sets text.selection on shift+arrow`, async ({ puppeteer: { browser } }) => {
  const page = await browser.newPage()
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')
  
  await page.evaluate(() => (window as unknown as WithGlobals).testState.textbox.text.string = 'Baleada')
  
  await page.focus('input')
  await page.keyboard.down('ArrowLeft')
  await page.keyboard.up('ArrowLeft')
  
  await page.evaluate(async () => await (window as unknown as WithGlobals).nextTick())
  
  await page.keyboard.down('Shift')
  await page.keyboard.press('ArrowRight')
  
  const value = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()
          return {
            start: (window as unknown as WithGlobals).testState.textbox.text.selection.start,
            end: (window as unknown as WithGlobals).testState.textbox.text.selection.end,
            direction: (window as unknown as WithGlobals).testState.textbox.text.selection.direction,
          }
        }),
        expected = {
          start: 0,
          end: 1,
          direction: 'forward',
        }

  assert.equal(value, expected)
})

// Arrow stuff not emulating properly
suite.skip(`sets text.selection on cmd+arrow`, async ({ puppeteer: { browser } }) => {
  const page = await browser.newPage()
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')
  
  await page.evaluate(() => (window as unknown as WithGlobals).testState.textbox.text.string = 'Baleada')
  
  await page.focus('input')
  await page.keyboard.down('ArrowLeft')
  await page.keyboard.up('ArrowLeft')
  
  await page.evaluate(async () => await (window as unknown as WithGlobals).nextTick())
  
  await page.keyboard.down('Meta')
  await page.keyboard.down('ArrowRight')
  await page.keyboard.up('ArrowRight')
  await page.keyboard.up('Meta')

  const value = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()
          return {
            start: (window as unknown as WithGlobals).testState.textbox.text.selection.start,
            end: (window as unknown as WithGlobals).testState.textbox.text.selection.end,
            direction: (window as unknown as WithGlobals).testState.textbox.text.selection.direction,
          }
        }),
        expected = {
          start: 'Baleada'.length,
          end: 'Baleada'.length,
          direction: 'forward',
        }

  assert.equal(value, expected)
})

suite(`records new history before undoing unrecorded changes on cmd+z`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.focus('input')
  await page.keyboard.type('abc')
  await page.keyboard.down('Meta')
  await page.keyboard.press('z')
  await page.keyboard.up('Meta')


  const value = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()
          return {
            historyLength: (window as unknown as WithGlobals).testState.textbox.history.array.length,
            historyLocation: (window as unknown as WithGlobals).testState.textbox.history.location,
          }
        }),
        expected = {
          historyLength: 2,
          historyLocation: 0,
        }

  assert.equal(value, expected)
})

suite(`does not record new history before undoing recorded changes on cmd+z`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.focus('input')
  await page.keyboard.type('abc ')
  await page.keyboard.down('Meta')
  await page.keyboard.press('z')
  await page.keyboard.up('Meta')


  const value = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()
          return {
            historyLength: (window as unknown as WithGlobals).testState.textbox.history.array.length,
            historyLocation: (window as unknown as WithGlobals).testState.textbox.history.location,
          }
        }),
        expected = {
          historyLength: 3, // Initial recording + 2 recordings from input
          historyLocation: 1,
        }

  assert.equal(value, expected)
})

suite(`does not record new history during consecutive undo's on cmd+z`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.focus('input')
  await page.keyboard.type('abc ')
  await page.keyboard.down('Meta')
  await page.keyboard.press('z')
  await page.keyboard.press('z')
  await page.keyboard.up('Meta')


  const value = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()
          return {
            historyLength: (window as unknown as WithGlobals).testState.textbox.history.array.length,
            historyLocation: (window as unknown as WithGlobals).testState.textbox.history.location,
          }
        }),
        expected = {
          historyLength: 3, // Initial recording + 2 recordings from input
          historyLocation: 0,
        }

  assert.equal(value, expected)
})

suite(`records new history before undoing unrecorded changes on ctrl+z`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.focus('input')
  await page.keyboard.type('abc')
  await page.keyboard.down('Control')
  await page.keyboard.press('z')
  await page.keyboard.up('Control')


  const value = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()
          return {
            historyLength: (window as unknown as WithGlobals).testState.textbox.history.array.length,
            historyLocation: (window as unknown as WithGlobals).testState.textbox.history.location,
          }
        }),
        expected = {
          historyLength: 2,
          historyLocation: 0,
        }

  assert.equal(value, expected)
})

suite(`does not record new history before undoing recorded changes on ctrl+z`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.focus('input')
  await page.keyboard.type('abc ')
  await page.keyboard.down('Control')
  await page.keyboard.press('z')
  await page.keyboard.up('Control')


  const value = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()
          return {
            historyLength: (window as unknown as WithGlobals).testState.textbox.history.array.length,
            historyLocation: (window as unknown as WithGlobals).testState.textbox.history.location,
          }
        }),
        expected = {
          historyLength: 3, // Initial recording + 2 recordings from input
          historyLocation: 1,
        }

  assert.equal(value, expected)
})

suite(`does not record new history during consecutive undo's on ctrl+z`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.focus('input')
  await page.keyboard.type('abc ')
  await page.keyboard.down('Control')
  await page.keyboard.press('z')
  await page.keyboard.press('z')
  await page.keyboard.up('Control')


  const value = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()
          return {
            historyLength: (window as unknown as WithGlobals).testState.textbox.history.array.length,
            historyLocation: (window as unknown as WithGlobals).testState.textbox.history.location,
          }
        }),
        expected = {
          historyLength: 3, // Initial recording + 2 recordings from input
          historyLocation: 0,
        }

  assert.equal(value, expected)
})

suite(`redoes on cmd+y`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.focus('input')
  await page.keyboard.type('abc ')

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.textbox.history.location = 0
    await (window as unknown as WithGlobals).nextTick()
  })

  await page.keyboard.down('Meta')
  await page.keyboard.press('y')
  await page.keyboard.up('Meta')

  const value = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()
          return (window as unknown as WithGlobals).testState.textbox.history.location

        }),
        expected = 1

  assert.is(value, expected)
})

suite(`redoes on ctrl+y`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')

  await page.focus('input')
  await page.keyboard.type('abc ')

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.textbox.history.location = 0
    await (window as unknown as WithGlobals).nextTick()
  })

  await page.keyboard.down('Control')
  await page.keyboard.press('y')
  await page.keyboard.up('Control')

  const value = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()
          return (window as unknown as WithGlobals).testState.textbox.history.location
        }),
        expected = 1

  assert.is(value, expected)
})

suite(`type(...) updates text.string`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.type('Baleada');
          await (window as unknown as WithGlobals).nextTick()
          return (window as unknown as WithGlobals).testState.textbox.text.string
        }),
        expected = 'Baleada'

  assert.is(value, expected)
})

suite(`select(...) updates text.selection`, async ({ puppeteer: { browser } }) => {
  const page = await browser.newPage()
  await page.goto('http://localhost:5173/useTextbox/withoutOptions')
  await page.waitForSelector('input')
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.textbox.text.string = 'Baleada'
          ;(window as unknown as WithGlobals).testState.textbox.select({
            start: 0,
            end: 'Baleada'.length,
            direction: 'forward',
          })

          await (window as unknown as WithGlobals).nextTick()

          return JSON.parse(JSON.stringify((window as unknown as WithGlobals).testState.textbox.text.selection))
        }),
        expected = {
          start: 0,
          end: 'Baleada'.length,
          direction: 'forward',
        }

  assert.equal(value, expected)
})

suite.run()
