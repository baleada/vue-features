import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('bindList')
)

suite(`binds static value to element, retaining original list items`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindList/elementStatic')

  await page.waitForSelector('span', { state: 'attached' })
  const value = await page.evaluate(async () => {
          return [...document.querySelector('span').classList]
        }),
        expected = ['stub', 'red']

  assert.equal(value, expected)
})

suite(`binds dynamic values to element, retaining original list items`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindList/elementRef')

  await page.waitForSelector('span', { state: 'attached' })
  const valueBefore = await page.evaluate(async () => {
          return [...document.querySelector('span').classList]
        }),
        expectedBefore = ['stub', 'red']
  
  assert.equal(valueBefore, expectedBefore)
  
  const valueAfter = await page.evaluate(async () => {
          window.testState.color.value = 'blue'
          await window.nextTick()
          return [...document.querySelector('span').classList]
        }),
        expectedAfter = ['stub', 'blue']

  assert.equal(valueAfter, expectedAfter)
})

suite(`binds value getter to element, retaining original list items`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindList/elementValueGetter')

  await page.waitForSelector('span', { state: 'attached' })
  const value = await page.evaluate(async () => {
          return [...document.querySelector('span').classList]
        }),
        expected = ['stub', 'red']

  assert.equal(value, expected)
})

suite(`binds static values to list`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindList/listStatic')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => ({ textContent: node.textContent, classList: [...node.classList] }))
        }),
        expected = [
          { textContent: '0', classList: ['stub'] },
          { textContent: '1', classList: ['stub'] },
          { textContent: '2', classList: ['stub'] },
        ]

  assert.equal(value, expected)
})

suite(`binds reactive values to list`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindList/listRef')
  await page.waitForSelector('span', { state: 'attached' })

  const expected: any = {}

  const from = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => ({ textContent: node.textContent, classList: [...node.classList] }))
  })
  expected.from = [
    { textContent: '0', classList: ['red'] },
    { textContent: '1', classList: ['red'] },
    { textContent: '2', classList: ['red'] },
  ]

  assert.equal(from, expected.from)

  await page.evaluate(async () => {
    window.testState.color.value = 'blue'
    await window.nextTick()
  })

  const to = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => ({ textContent: node.textContent, classList: [...node.classList] }))
  })
  expected.to = [
    { textContent: '0', classList: ['blue'] },
    { textContent: '1', classList: ['blue'] },
    { textContent: '2', classList: ['blue'] },
  ]

  assert.equal(to, expected.to)
})

suite(`binds value getter to list`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindList/listValueGetter')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => ({ textContent: node.textContent, classList: [...node.classList] }))
        }),
        expected = [
          { textContent: '0', classList: ['0'] },
          { textContent: '1', classList: ['1'] },
          { textContent: '2', classList: ['2'] },
        ]

  assert.equal(value, expected)
})

suite(`binds static values to plane`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindList/planeStatic')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => ({ textContent: node.textContent, classList: [...node.classList] }))
        }),
        expected = [
          { textContent: '0,0', classList: ['stub'] },
          { textContent: '0,1', classList: ['stub'] },
          { textContent: '0,2', classList: ['stub'] },
          
          { textContent: '1,0', classList: ['stub'] },
          { textContent: '1,1', classList: ['stub'] },
          { textContent: '1,2', classList: ['stub'] },
        ]

  assert.equal(value, expected)
})

suite(`binds reactive values to plane`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindList/planeRef')
  await page.waitForSelector('span', { state: 'attached' })

  const expected: any = {}

  const from = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => ({ textContent: node.textContent, classList: [...node.classList] }))
  })
  expected.from = [
    { textContent: '0,0', classList: ['red'] },
    { textContent: '0,1', classList: ['red'] },
    { textContent: '0,2', classList: ['red'] },
    { textContent: '1,0', classList: ['red'] },
    { textContent: '1,1', classList: ['red'] },
    { textContent: '1,2', classList: ['red'] },
  ]

  assert.equal(from, expected.from)

  await page.evaluate(async () => {
    window.testState.color.value = 'blue'
    await window.nextTick()
  })

  const to = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => ({ textContent: node.textContent, classList: [...node.classList] }))
  })
  expected.to = [
    { textContent: '0,0', classList: ['blue'] },
    { textContent: '0,1', classList: ['blue'] },
    { textContent: '0,2', classList: ['blue'] },
    { textContent: '1,0', classList: ['blue'] },
    { textContent: '1,1', classList: ['blue'] },
    { textContent: '1,2', classList: ['blue'] },
  ]

  assert.equal(to, expected.to)
})

suite(`binds value getter to plane`, async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindList/planeValueGetter')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => ({ textContent: node.textContent, classList: [...node.classList] }))
        }),
        expected = [
          { textContent: '0,0', classList: ['00'] },
          { textContent: '0,1', classList: ['01'] },
          { textContent: '0,2', classList: ['02'] },
          { textContent: '1,0', classList: ['10'] },
          { textContent: '1,1', classList: ['11'] },
          { textContent: '1,2', classList: ['12'] },
        ]

  assert.equal(value, expected)
})

suite.run()
