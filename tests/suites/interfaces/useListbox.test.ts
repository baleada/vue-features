import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useListbox')
)

// suite(`aria roles are correctly assigned`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:3000/useListbox/withoutOptions')
//   await page.waitForSelector('div')

//   const listbox = await page.evaluate(() => document.querySelector('div').getAttribute('role'))
//   assert.is(listbox, 'listbox')

//   const options = await page.evaluate(() => {
//     const divs = [...document.querySelectorAll('div div')],
//           options = divs.slice(0, 3)
    
//     return options.map(el => el.getAttribute('role'))
//   })
//   assert.equal(options, (new Array(3)).fill('option'))
// })

// suite(`aria-orientation is correctly assigned`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:3000/useListbox/horizontal')
//   await page.waitForSelector('div')
//   const horizontal = await page.evaluate(async () => document.querySelector('div').getAttribute('aria-orientation'))
//   assert.is(horizontal, 'horizontal')

//   await page.goto('http://localhost:3000/useListbox/vertical')
//   await page.waitForSelector('div')
//   const vertical = await page.evaluate(async () => document.querySelector('div').getAttribute('aria-orientation'))
//   assert.is(vertical, 'vertical')
// })

// suite(`options are focusable`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:3000/useListbox/horizontal')
//   await page.waitForSelector('div')

//   const options = await page.evaluate(() => {
//     const divs = [...document.querySelectorAll('div div')],
//           options = divs.slice(0, 3)
    
//     return options.map(el => el.getAttribute('tabindex'))
//   })
//   assert.equal(options, (new Array(3)).fill('0'))
// })

// suite(`listbox's aria-owns optionally matches options' IDs`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:3000/useListbox/withOptions')
//   await page.waitForSelector('div')

//   const ariaOwns = await page.evaluate(() => document.querySelector('div').getAttribute('aria-owns')),
//         options = await page.evaluate(() => {
//           const divs = [...document.querySelectorAll('div div')],
//                 options = divs.slice(0, 3)
          
//           return options.map(el => el.id)
//         })

//   assert.is(ariaOwns, options.join(' '))
// })

// suite(`selected option's aria-selected is true and others are false`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:3000/useListbox/horizontal')
//   await page.waitForSelector('div')

//   const options = await page.evaluate(async () => {
//           const divs = [...document.querySelectorAll('div div')],
//                 options = divs.slice(0, 3)
          
//           return options.map(el => el.getAttribute('aria-selected'))
//         })

//   assert.equal(options, ['true', 'false', 'false'])
// })

// // TODO: active

// suite(`selected option and is.selected function react to listbox.selected`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:3000/useListbox/horizontal')
//   await page.waitForSelector('div')

//   const value = await page.evaluate(async () => {
//           const divs = [...document.querySelectorAll('div div')],
//                 options = divs.slice(0, 3),
//                 from = {
//                   options: options.map(el => el.getAttribute('aria-selected')),
//                   is: {
//                     selected: (window as unknown as WithGlobals).testState.listbox.is.selected(1),
//                   },
//                 };
          
//           (window as unknown as WithGlobals).testState.listbox.select(1)
//           await (window as unknown as WithGlobals).nextTick()
          
//           const to = {
//             options: options.map(el => el.getAttribute('aria-selected')),
//             is: {
//               selected: (window as unknown as WithGlobals).testState.listbox.is.selected(1),
//             },
//           }
          
//           return { from, to }
//         })

//   assert.equal(value.from.options, ['true', 'false', 'false'])
//   assert.equal(value.from.is.selected, false)
//   assert.equal(value.to.options, ['false', 'true', 'false'])
//   assert.equal(value.to.is.selected, true)
// })

// suite(`respects initialSelected option`, async ({ puppeteer: { page } }) => {
//   // Separate route for this one, because initial selection throws off the arithmetic on all the other withOptions tests
//   await page.goto('http://localhost:3000/useListbox/withInitialSelected')
//   await page.waitForSelector('div')

//   const value = await page.evaluate(async () => {
//           return (window as unknown as WithGlobals).testState.listbox.selected
//         }),
//         expected = 1

//   assert.is(value, expected)
// })

// suite(`mouseup on an option selects that option`, async ({ puppeteer: { page, mouseClick } }) => {
//   await page.goto('http://localhost:3000/useListbox/horizontal')
//   await page.waitForSelector('div')

//   const from = await page.evaluate(() => (window as unknown as WithGlobals).testState.listbox.selected)
//   await mouseClick('div div:nth-child(2)')
//   const to = await page.evaluate(() => (window as unknown as WithGlobals).testState.listbox.selected)

//   assert.is(from, 0)
//   assert.is(to, 1)
// })

// suite(`when focus transfers to the option via the keyboard, the selected option is focused instead`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:3000/useListbox/horizontal')
//   await page.waitForSelector('div')

//   await page.evaluate(async () => {
//     (window as unknown as WithGlobals).testState.listbox.navigateable.navigate(1)
//     await (window as unknown as WithGlobals).nextTick()
//     document.querySelector('input').focus()
//   })
//   await page.keyboard.press('Tab')
//   const value = await page.evaluate(async () => {
//     await (window as unknown as WithGlobals).nextTick()
//     return document.activeElement.textContent
//   })

//   assert.is(value, 'Option #2')
// })

// suite(`when the listbox is horizontal, left and right arrow keys control tab focus`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:3000/useListbox/horizontal')
//   await page.waitForSelector('div')

//   await page.evaluate(async () => document.querySelector('input').focus())
//   await page.keyboard.press('Tab')

//   await page.keyboard.press('ArrowRight')
//   const afterRight = await page.evaluate(async () => document.activeElement.textContent)
//   assert.is(afterRight, 'Option #2')

//   await page.keyboard.press('ArrowLeft')
//   const afterLeft = await page.evaluate(async () => document.activeElement.textContent)
//   assert.is(afterLeft, 'Option #1')
// })

// suite(`when the listbox is horizontal, up and down arrow keys do not control tab focus`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:3000/useListbox/horizontal')
//   await page.waitForSelector('div')

//   await page.evaluate(async () => document.querySelector('input').focus())
//   await page.keyboard.press('Tab')

//   await page.keyboard.press('ArrowDown')
//   const afterDown = await page.evaluate(async () => document.activeElement.textContent)
//   assert.is(afterDown, 'Option #1')

//   await page.keyboard.press('ArrowUp')
//   const afterUp = await page.evaluate(async () => document.activeElement.textContent)
//   assert.is(afterUp, 'Option #1')
// })

// suite(`when the listbox is vertical, up and down arrow keys control tab focus`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:3000/useListbox/vertical')
//   await page.waitForSelector('div')

//   await page.evaluate(async () => document.querySelector('input').focus())
//   await page.keyboard.press('Tab')

//   await page.keyboard.press('ArrowDown')
//   const afterDown = await page.evaluate(async () => document.activeElement.textContent)
//   assert.is(afterDown, 'Option #2')

//   await page.keyboard.press('ArrowUp')
//   const afterUp = await page.evaluate(async () => document.activeElement.textContent)
//   assert.is(afterUp, 'Option #1')
// })

// suite(`when the listbox is vertical, left and right arrow keys do not control tab focus`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:3000/useListbox/vertical')
//   await page.waitForSelector('div')

//   await page.evaluate(async () => document.querySelector('input').focus())
//   await page.keyboard.press('Tab')

//   await page.keyboard.press('ArrowRight')
//   const afterRight = await page.evaluate(async () => document.activeElement.textContent)
//   assert.is(afterRight, 'Option #1')

//   await page.keyboard.press('ArrowLeft')
//   const afterLeft = await page.evaluate(async () => document.activeElement.textContent)
//   assert.is(afterLeft, 'Option #1')
// })

// suite(`home key focuses first option`, async ({ puppeteer: { page, mouseClick } }) => {
//   await page.goto('http://localhost:3000/useListbox/horizontal')
//   await page.waitForSelector('div')

//   await mouseClick('div div:nth-child(3)')
  
//   await page.keyboard.press('Home')
//   const value = await page.evaluate(async () => document.activeElement.textContent)
//   assert.is(value, 'Option #1')
// })

// suite(`end key focuses last option`, async ({ puppeteer: { page, mouseClick } }) => {
//   await page.goto('http://localhost:3000/useListbox/horizontal')
//   await page.waitForSelector('div')

//   await mouseClick('div div:nth-child(1)')
  
//   await page.keyboard.press('End')
//   const value = await page.evaluate(async () => document.activeElement.textContent)
//   assert.is(value, 'Option #3')
// })

// suite(`selected option reacts to navigateable`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:3000/useListbox/horizontal')
//   await page.waitForSelector('div')

//   await page.evaluate(async () => document.querySelector('input').focus())
//   await page.keyboard.press('Tab')

//   const value = await page.evaluate(async () => {
//           const divs = [...document.querySelectorAll('div div')],
//                 options = divs.slice(0, 3),
//                 from = options.map(el => `${document.activeElement.isSameNode(el)}`);
          
//           (window as unknown as WithGlobals).testState.listbox.navigateable.navigate(1)
//           await (window as unknown as WithGlobals).nextTick()
          
//           const to = options.map(el => `${document.activeElement.isSameNode(el)}`);
          
//           return { from, to }
//         })

//   assert.equal(value.from, ['true', 'false', 'false'])
//   assert.equal(value.to, ['false', 'true', 'false'])
// })

// suite(`spacebar selects the focused option`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:3000/useListbox/withOptions')
//   await page.waitForSelector('div')

//   await page.evaluate(async () => document.querySelector('input').focus())
//   await page.keyboard.press('Tab')
//   await page.keyboard.press('Tab')

//   const from = await page.evaluate(() => (window as unknown as WithGlobals).testState.listbox.selected)
//   await page.keyboard.press(' ')
//   const to = await page.evaluate(() => (window as unknown as WithGlobals).testState.listbox.selected)

//   assert.is(from, 0)
//   assert.is(to, 1)
// })

// suite(`enter key selects the focused option`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:3000/useListbox/withOptions')
//   await page.waitForSelector('div')

//   await page.evaluate(async () => document.querySelector('input').focus())
//   await page.keyboard.press('Tab')
//   await page.keyboard.press('Tab')

//   const from = await page.evaluate(() => (window as unknown as WithGlobals).testState.listbox.selected)
//   await page.keyboard.press('Enter')
//   const to = await page.evaluate(() => (window as unknown as WithGlobals).testState.listbox.selected)

//   assert.is(from, 0)
//   assert.is(to, 1)
// })

// // TODO: can't delete via keystroke
// suite(`when an option is deleted, it is no longer eligible to be selected`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:3000/useListbox/withOptions')
//   await page.waitForSelector('div')

//   await page.evaluate(async () => document.querySelector('input').focus())
//   await page.keyboard.press('Tab')
//   await page.evaluate(async () => {
//     (window as unknown as WithGlobals).testState.deleteOption((window as unknown as WithGlobals).testState.listbox.selected)
//     await (window as unknown as WithGlobals).nextTick()
//   })
  
//   const value = await page.evaluate(() => [...(window as unknown as WithGlobals).testState.listbox.navigateable.array.map((_, index) => index)]),
//         expected = [0, 1]
//   assert.equal(value, expected)
// })

// suite(`when an option gets deleted while it's selected, the next option gets selected`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:3000/useListbox/withOptions')
//   await page.waitForSelector('div')

//   await page.evaluate(async () => document.querySelector('input').focus())
//   await page.keyboard.press('Tab')
//   await page.keyboard.press('Enter')
//   await page.evaluate(async () => {
//     (window as unknown as WithGlobals).testState.deleteOption((window as unknown as WithGlobals).testState.listbox.selected)
//     await (window as unknown as WithGlobals).nextTick()
//   })
//   await page.evaluate(async () => await (window as unknown as WithGlobals).nextTick())
  
//   const index = await page.evaluate(() => (window as unknown as WithGlobals).testState.listbox.selected),
//         text = await page.evaluate(() => document.querySelector('[aria-selected="true"]').textContent)

//   assert.is(index, 0)
//   assert.is(text, 'Option #2')
// })

// suite(`when an option gets deleted while it's active but not selected, the next option gets activated, and the selected option does not change`, async ({ puppeteer: { page, tab } }) => {
//   await page.goto('http://localhost:3000/useListbox/withOptions')
//   await page.waitForSelector('div')

//   await page.evaluate(async () => document.querySelector('input').focus())
//   await tab({ direction: 'forward', total: 3 })
//   await page.evaluate(async () => await (window as unknown as WithGlobals).nextTick())
//   await page.keyboard.press('Enter')
//   await tab({ direction: 'backward', total: 2 })
//   await page.evaluate(async () => await (window as unknown as WithGlobals).nextTick())
//   await page.evaluate(async () => {
//     (window as unknown as WithGlobals).testState.deleteOption((window as unknown as WithGlobals).testState.listbox.selected)
//     await (window as unknown as WithGlobals).nextTick()
//   })
//   await page.evaluate(async () => await (window as unknown as WithGlobals).nextTick())
  
//   const activeText = await page.evaluate(() => document.activeElement.textContent),
//         selectedText = await page.evaluate(() => document.querySelector('[aria-selected="true"]').textContent)

//   assert.is(activeText, 'Option #2')
//   assert.is(selectedText, 'Option #3')
// })

// suite(`when the last option is deleted while it's selected, the previously second-to-last option gets selected`, async ({ puppeteer: { page, tab } }) => {
//   await page.goto('http://localhost:3000/useListbox/withOptions')
//   await page.waitForSelector('div')

//   await page.evaluate(async () => document.querySelector('input').focus())
//   await tab({ direction: 'forward', total: 3 })
//   await page.keyboard.press('Enter')
//   await page.evaluate(async () => {
//     (window as unknown as WithGlobals).testState.deleteOption((window as unknown as WithGlobals).testState.listbox.selected)
//     await (window as unknown as WithGlobals).nextTick()
//   })
  
//   const value = await page.evaluate(() => (window as unknown as WithGlobals).testState.listbox.selected),
//         expected = 1
//   assert.equal(value, expected)
// })

// suite(`reacts to dynamically added options`, async ({ puppeteer: { page, tab } }) => {
//   await page.goto('http://localhost:3000/useListbox/withOptions')
//   await page.waitForSelector('div')

//   await page.evaluate(async () => {
//     (window as unknown as WithGlobals).testState.add()
//     await (window as unknown as WithGlobals).nextTick()
//     document.querySelector('input').focus()
//   })
//   await tab({ direction: 'forward', total: 4 })

//   const value = await page.evaluate(async () => {
//           await (window as unknown as WithGlobals).nextTick()
//           return document.querySelector('[aria-selected="true"]').textContent
//         }),
//         expected = 'Option #4'

//   assert.is(value, expected)
// })

// suite(`reacts to dynamically reordered options`, async ({ puppeteer: { page, tab } }) => {
//   await page.goto('http://localhost:3000/useListbox/withOptions')
//   await page.waitForSelector('div')

//   await page.evaluate(async () => {
//     (window as unknown as WithGlobals).testState.reorder()
//     await (window as unknown as WithGlobals).nextTick()
//     document.querySelector('input').focus()
//   })
//   await tab({ direction: 'forward', total: 2 })

//   const value = await page.evaluate(async () => {
//           await (window as unknown as WithGlobals).nextTick()
//           return document.querySelector('[aria-selected="true"]').textContent
//         }),
//         expected = 'Option #3'

//   assert.is(value, expected)
// })

suite.run()
