import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useStyleBinding (browser)')
)

suite(`binds static values to styles`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useStyleBinding/static')

  await page.waitForSelector('span')
  const value = await page.evaluate(async () => {
          return document.querySelector('span').style.backgroundColor
        }),
        expected = 'red'

  assert.is(value, expected)
})

suite(`binds dynamic values to styles`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useStyleBinding/dynamic')

  await page.waitForSelector('span')
  const valueBefore = await page.evaluate(async () => {
          return document.querySelector('span').style.backgroundColor
        }),
        expectedBefore = 'red'
  
  assert.is(valueBefore, expectedBefore)
  
  await page.click('button')
  const valueAfter = await page.evaluate(async () => {
          return document.querySelector('span').style.backgroundColor
        }),
        expectedAfter = 'blue'

  assert.is(valueAfter, expectedAfter)
})

suite(`binds values via the value closure to properties on arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useStyleBinding/valueClosureArray')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => (({ textContent, style: { backgroundColor } }) => ({ textContent, backgroundColor }))(node))
        }),
        expected = [
          { textContent: 'red', backgroundColor: 'red' },
          { textContent: 'blue', backgroundColor: 'blue' },
          { textContent: 'green', backgroundColor: 'green' },
        ]

  assert.equal(value, expected)
})

suite.run()
