import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('bindStyle')
)

suite('binds static value to element', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/bindStyle/elementStatic')

  await page.waitForSelector('span')
  const value = await page.evaluate(async () => {
          return document.querySelector('span').style.backgroundColor
        }),
        expected = 'red'

  assert.equal(value, expected)
})

suite('binds dynamic values to element', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/bindStyle/elementRef')

  await page.waitForSelector('span')
  const valueBefore = await page.evaluate(async () => {
          return document.querySelector('span').style.backgroundColor
        }),
        expectedBefore = 'red'
  
  assert.equal(valueBefore, expectedBefore)
  
  const valueAfter = await page.evaluate(async () => {
          window.testState.color.value = 'blue'
          await window.nextTick()
          return document.querySelector('span').style.backgroundColor
        }),
        expectedAfter = 'blue'

  assert.equal(valueAfter, expectedAfter)
})

suite('binds value getter to element', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/bindStyle/elementValueGetter')

  await page.waitForSelector('span')
  const value = await page.evaluate(async () => {
          return document.querySelector('span').style.backgroundColor
        }),
        expected = 'red'

  assert.equal(value, expected)
})

suite('binds static values to list', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/bindStyle/listStatic')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => ({ textContent: node.textContent, style: node.style.backgroundColor }))
        }),
        expected = [
          { textContent: '0', style: 'red' },
          { textContent: '1', style: 'red' },
          { textContent: '2', style: 'red' },
        ]

  assert.equal(value, expected)
})

suite('binds reactive values to list', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/bindStyle/listRef')
  await page.waitForSelector('span')

  const expected: any = {}

  const from = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => ({ textContent: node.textContent, style: node.style.backgroundColor }))
  })
  expected.from = [
    { textContent: '0', style: 'red' },
    { textContent: '1', style: 'red' },
    { textContent: '2', style: 'red' },
  ]

  assert.equal(from, expected.from)

  await page.evaluate(async () => {
    window.testState.color.value = 'blue'
    await window.nextTick()
  })

  const to = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => ({ textContent: node.textContent, style: node.style.backgroundColor }))
  })
  expected.to = [
    { textContent: '0', style: 'blue' },
    { textContent: '1', style: 'blue' },
    { textContent: '2', style: 'blue' },
  ]

  assert.equal(to, expected.to)
})

suite('binds value getter to list', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/bindStyle/listValueGetter')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => ({ textContent: node.textContent, style: node.style.backgroundColor }))
        }),
        expected = [
          { textContent: '0', style: 'red' },
          { textContent: '1', style: 'blue' },
          { textContent: '2', style: 'green' },
        ]

  assert.equal(value, expected)
})

suite('binds static values to plane', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/bindStyle/planeStatic')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => ({ textContent: node.textContent, style: node.style.backgroundColor }))
        }),
        expected = [
          { textContent: '0,0', style: 'red' },
          { textContent: '0,1', style: 'red' },
          { textContent: '0,2', style: 'red' },
          
          { textContent: '1,0', style: 'red' },
          { textContent: '1,1', style: 'red' },
          { textContent: '1,2', style: 'red' },
        ]

  assert.equal(value, expected)
})

suite('binds reactive values to plane', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/bindStyle/planeRef')
  await page.waitForSelector('span')

  const expected: any = {}

  const from = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => ({ textContent: node.textContent, style: node.style.backgroundColor }))
  })
  expected.from = [
    { textContent: '0,0', style: 'red' },
    { textContent: '0,1', style: 'red' },
    { textContent: '0,2', style: 'red' },
    { textContent: '1,0', style: 'red' },
    { textContent: '1,1', style: 'red' },
    { textContent: '1,2', style: 'red' },
  ]

  assert.equal(from, expected.from)

  await page.evaluate(async () => {
    window.testState.color.value = 'blue'
    await window.nextTick()
  })

  const to = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => ({ textContent: node.textContent, style: node.style.backgroundColor }))
  })
  expected.to = [
    { textContent: '0,0', style: 'blue' },
    { textContent: '0,1', style: 'blue' },
    { textContent: '0,2', style: 'blue' },
    { textContent: '1,0', style: 'blue' },
    { textContent: '1,1', style: 'blue' },
    { textContent: '1,2', style: 'blue' },
  ]

  assert.equal(to, expected.to)
})

suite('binds value getter to plane', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/bindStyle/planeValueGetter')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => ({ textContent: node.textContent, style: node.style.backgroundColor }))
        }),
        expected = [
          { textContent: '0,0', style: 'red' },
          { textContent: '0,1', style: 'blue' },
          { textContent: '0,2', style: 'green' },
          { textContent: '1,0', style: 'purple' },
          { textContent: '1,1', style: 'orange' },
          { textContent: '1,2', style: 'yellow' },
        ]

  assert.equal(value, expected)
})

suite.run()
