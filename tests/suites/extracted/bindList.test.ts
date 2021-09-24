import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('bindList')
)

suite(`binds static values to lists, and retains original values`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/bindList/static')

  await page.waitForSelector('span')
  const value = await page.evaluate(async () => {
          return [...document.querySelector('span').classList]
        }),
        expected = ['stub', 'red']

  assert.equal(value, expected)
})

suite(`binds dynamic values to lists, and retains original values`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/bindList/dynamic')

  await page.waitForSelector('span')
  const valueBefore = await page.evaluate(async () => {
          return [...document.querySelector('span').classList]
        }),
        expectedBefore = ['stub', 'red']
  
  assert.equal(valueBefore, expectedBefore)
  
  await page.click('button')
  const valueAfter = await page.evaluate(async () => {
          return [...document.querySelector('span').classList]
        }),
        expectedAfter = ['stub', 'blue']

  assert.equal(valueAfter, expectedAfter)
})

suite(`binds dynamic values to attributes on arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/bindList/dynamicArray')
  await page.waitForSelector('span')

  const expected: any = {}

  const from = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => (({ textContent, classList }) => ({ textContent, classList: [...classList] }))(node))
  })
  expected.from = [
    { textContent: 'red', classList: ['stub', 'red'] },
    { textContent: 'blue', classList: ['stub', 'red'] },
    { textContent: 'green', classList: ['stub', 'red'] },
  ]

  assert.equal(from, expected.from)

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.setColor('blue')
    await (window as unknown as WithGlobals).nextTick()
  })

  const to = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => (({ textContent, classList }) => ({ textContent, classList: [...classList] }))(node))
  })
  expected.to = [
    { textContent: 'red', classList: ['stub', 'blue'] },
    { textContent: 'blue', classList: ['stub', 'blue'] },
    { textContent: 'green', classList: ['stub', 'blue'] },
  ]

  assert.equal(to, expected.to)
})

suite(`binds values via getValue to lists on arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/bindList/getValueArray')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => (({ textContent, classList }) => ({ textContent, classList: [...classList] }))(node))
        }),
        expected = [
          { textContent: 'red', classList: ['stub', 'red'] },
          { textContent: 'blue', classList: ['stub', 'blue'] },
          { textContent: 'green', classList: ['stub', 'green'] },
        ]

  assert.equal(value, expected)
})

suite.run()
