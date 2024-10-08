// import { suite as createSuite } from 'uvu'
// import * as assert from 'uvu/assert'
// import { withPlaywright } from '@baleada/prepare'
// 
// const suite = withPlaywright(
//   createSuite('navigateOnBasic')
// )

// suite(`home key navigates to first eligible`, async ({ playwright: { page } }) => {
//   await page.goto('http://localhost:5173/navigateOnBasic')
//   await page.waitForSelector('input', { state: 'attached' })

//   await page.click('input')
//   await page.keyboard.press('Tab')
  
//   await page.keyboard.press('Home')
//   const value = await page.evaluate(async () => {
//           return window.testState.navigateable.location
//         }),
//         expected = 0

//   assert.is(value, expected)
// })

// suite(`end key navigates to first eligible`, async ({ playwright: { page } }) => {
//   await page.goto('http://localhost:5173/navigateOnBasic')
//   await page.waitForSelector('input', { state: 'attached' })

//   await page.click('input')
//   await page.keyboard.press('Tab')
  
//   await page.keyboard.press('End')
//   const value = await page.evaluate(async () => {
//           return window.testState.navigateable.location
//         }),
//         expected = 2

//   assert.is(value, expected)
// })

// suite.run()
