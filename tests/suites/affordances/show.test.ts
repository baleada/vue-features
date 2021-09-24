import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('show')
)

suite(`conditionally toggles display between 'none' and original value`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/show/dynamic')

  await page.waitForSelector('span')
  const value1 = await page.evaluate(async () => {
          return window.getComputedStyle(document.querySelector('span')).display
        }),
        expected1 = 'inline'
  assert.is(value1, expected1)
  
  const value2 = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.toggle()
          await (window as unknown as WithGlobals).nextTick()
          return window.getComputedStyle(document.querySelector('span')).display
        }),
        expected2 = 'none'

  assert.is(value2, expected2)
  
  const value3 = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.toggle()
          await (window as unknown as WithGlobals).nextTick()
          return window.getComputedStyle(document.querySelector('span')).display
        }),
        expected3 = 'inline'

  assert.is(value3, expected3)
})

suite(`conditionally toggles display via getValue for arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/show/getValueArray')
  await page.waitForSelector('span')

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
    (window as unknown as WithGlobals).testState.toggle(1)
    await (window as unknown as WithGlobals).nextTick()
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

console.warn('Manually test transitions')

suite.run()
