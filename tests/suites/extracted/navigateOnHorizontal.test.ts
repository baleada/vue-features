// import { suite as createSuite } from 'uvu'
// import * as assert from 'uvu/assert'
// import { withPuppeteer } from '@baleada/prepare'
// 
// const suite = withPuppeteer(
//   createSuite('navigateOnHorizontal')
// )

// suite(`right navigates to next eligible`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:5173/navigateOnHorizontal')
//   await page.waitForSelector('input')

//   await page.click('input')
//   await page.keyboard.press('Tab')
  
//   await page.keyboard.press('ArrowRight')
//   const value = await page.evaluate(async () => {
//           return window.testState.navigateable.location
//         }),
//         expected = 3

//   assert.is(value, expected)
// })

// suite(`left navigates to previous eligible`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:5173/navigateOnHorizontal')
//   await page.waitForSelector('input')

//   await page.click('input')
//   await page.keyboard.press('Tab')
  
//   await page.keyboard.press('ArrowLeft')
//   const value = await page.evaluate(async () => {
//           return window.testState.navigateable.location
//         }),
//         expected = 1

//   assert.is(value, expected)
// })

// suite(`cmd+right navigates to last eligible`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:5173/navigateOnHorizontal')
//   await page.waitForSelector('input')

//   await page.click('input')
//   await page.keyboard.press('Tab')
  
//   await page.keyboard.down('Meta')
//   await page.keyboard.press('ArrowRight')
//   await page.keyboard.up('Meta')
//   const value = await page.evaluate(async () => {
//           return window.testState.navigateable.location
//         }),
//         expected = 4

//   assert.is(value, expected)
// })

// suite(`ctrl+right navigates to last eligible`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:5173/navigateOnHorizontal')
//   await page.waitForSelector('input')

//   await page.click('input')
//   await page.keyboard.press('Tab')
  
//   await page.keyboard.down('Control')
//   await page.keyboard.press('ArrowRight')
//   await page.keyboard.up('Control')
//   const value = await page.evaluate(async () => {
//           return window.testState.navigateable.location
//         }),
//         expected = 4

//   assert.is(value, expected)
// })

// suite(`cmd+left navigates to previous eligible`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:5173/navigateOnHorizontal')
//   await page.waitForSelector('input')

//   await page.click('input')
//   await page.keyboard.press('Tab')
  
//   await page.keyboard.down('Meta')
//   await page.keyboard.press('ArrowLeft')
//   await page.keyboard.up('Meta')
//   const value = await page.evaluate(async () => {
//           return window.testState.navigateable.location
//         }),
//         expected = 0

//   assert.is(value, expected)
// })

// suite(`ctrl+left navigates to previous eligible`, async ({ puppeteer: { page } }) => {
//   await page.goto('http://localhost:5173/navigateOnHorizontal')
//   await page.waitForSelector('input')

//   await page.click('input')
//   await page.keyboard.press('Tab')
  
//   await page.keyboard.down('Control')
//   await page.keyboard.press('ArrowLeft')
//   await page.keyboard.up('Control')
//   const value = await page.evaluate(async () => {
//           return window.testState.navigateable.location
//         }),
//         expected = 0

//   assert.is(value, expected)
// })

// suite.run()
