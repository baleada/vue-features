// import { suite as createSuite } from 'uvu'
// import * as assert from 'uvu/assert'
// import { withPlaywright } from '@baleada/prepare'
// 
// const suite = withPlaywright(
//   createSuite('navigateOnVertical')
// )

// suite(`down navigates to next eligible`, async ({ playwright: { page } }) => {
//   await page.goto('http://localhost:5173/navigateOnVertical')
//   await page.waitForSelector('input', { state: 'attached' })

//   await page.click('input')
//   await page.keyboard.press('Tab')
  
//   await page.keyboard.press('ArrowDown')
//   const value = await page.evaluate(async () => {
//           return window.testState.navigateable.location
//         }),
//         expected = 3

//   assert.is(value, expected)
// })

// suite(`up navigates to previous eligible`, async ({ playwright: { page } }) => {
//   await page.goto('http://localhost:5173/navigateOnVertical')
//   await page.waitForSelector('input', { state: 'attached' })

//   await page.click('input')
//   await page.keyboard.press('Tab')
  
//   await page.keyboard.press('ArrowUp')
//   const value = await page.evaluate(async () => {
//           return window.testState.navigateable.location
//         }),
//         expected = 1

//   assert.is(value, expected)
// })

// suite(`cmd+down navigates to last eligible`, async ({ playwright: { page } }) => {
//   await page.goto('http://localhost:5173/navigateOnVertical')
//   await page.waitForSelector('input', { state: 'attached' })

//   await page.click('input')
//   await page.keyboard.press('Tab')
  
//   await page.keyboard.down('Meta')
//   await page.keyboard.press('ArrowDown')
//   await page.keyboard.up('Meta')
//   const value = await page.evaluate(async () => {
//           return window.testState.navigateable.location
//         }),
//         expected = 4

//   assert.is(value, expected)
// })

// suite(`ctrl+down navigates to last eligible`, async ({ playwright: { page } }) => {
//   await page.goto('http://localhost:5173/navigateOnVertical')
//   await page.waitForSelector('input', { state: 'attached' })

//   await page.click('input')
//   await page.keyboard.press('Tab')
  
//   await page.keyboard.down('Control')
//   await page.keyboard.press('ArrowDown')
//   await page.keyboard.up('Control')
//   const value = await page.evaluate(async () => {
//           return window.testState.navigateable.location
//         }),
//         expected = 4

//   assert.is(value, expected)
// })

// suite(`cmd+up navigates to previous eligible`, async ({ playwright: { page } }) => {
//   await page.goto('http://localhost:5173/navigateOnVertical')
//   await page.waitForSelector('input', { state: 'attached' })

//   await page.click('input')
//   await page.keyboard.press('Tab')
  
//   await page.keyboard.down('Meta')
//   await page.keyboard.press('ArrowUp')
//   await page.keyboard.up('Meta')
//   const value = await page.evaluate(async () => {
//           return window.testState.navigateable.location
//         }),
//         expected = 0

//   assert.is(value, expected)
// })

// suite(`ctrl+up navigates to previous eligible`, async ({ playwright: { page } }) => {
//   await page.goto('http://localhost:5173/navigateOnVertical')
//   await page.waitForSelector('input', { state: 'attached' })

//   await page.click('input')
//   await page.keyboard.press('Tab')
  
//   await page.keyboard.down('Control')
//   await page.keyboard.press('ArrowUp')
//   await page.keyboard.up('Control')
//   const value = await page.evaluate(async () => {
//           return window.testState.navigateable.location
//         }),
//         expected = 0

//   assert.is(value, expected)
// })

// suite.run()
