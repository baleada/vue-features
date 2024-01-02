import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('show')
)

suite.skip(`conditionally toggles display between 'none' and original value`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/show/element')

  await page.waitForSelector('span', { state: 'attached' })
  const value1 = await page.evaluate(async () => {
          return window.getComputedStyle(document.querySelector('span')).display
        }),
        expected1 = 'inline'
  assert.is(value1, expected1)
  
  const value2 = await page.evaluate(async () => {
          window.testState.toggle()
          await window.nextTick()
          return window.getComputedStyle(document.querySelector('span')).display
        }),
        expected2 = 'none'

  assert.is(value2, expected2)
  
  const value3 = await page.evaluate(async () => {
          window.testState.toggle()
          await window.nextTick()
          return window.getComputedStyle(document.querySelector('span')).display
        }),
        expected3 = 'inline'

  assert.is(value3, expected3)
})

suite.skip(`conditionally toggles display via getValue for arrays of elements`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/show/list')
  await page.waitForSelector('span', { state: 'attached' })

  const expected: any = {}

  const from = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => (({ textContent, style: { display } }) => ({ textContent, display }))(node))
  })
  expected.from = [
    { textContent: '0', display: 'inline' },
    { textContent: '1', display: 'inline' },
    { textContent: '2', display: 'inline' },
  ]

  assert.equal(from, expected.from)
  
  await page.evaluate(async () => {
    window.testState.toggle(1)
    await window.nextTick()
  })
  const to = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => (({ textContent, style: { display } }) => ({ textContent, display }))(node))
  })
  expected.to = [
    { textContent: '0', display: 'inline' },
    { textContent: '1', display: 'none' },
    { textContent: '2', display: 'inline' },
  ]

  assert.equal(to, expected.to)
})

// displays none with no transition if condition is false on first scheduled effect

console.warn('Manually test transitions')

suite.run()
