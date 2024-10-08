import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('bindAttributeOrProperty')
)

suite('binds static value to element', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindAttributeOrProperty/elementStatic')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return document.querySelector('span').id
        }),
        expected = 'stub'

  assert.is(value, expected)
})

suite('binds reactive value to element', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindAttributeOrProperty/elementRef')
  await page.waitForSelector('span', { state: 'attached' })

  const valueBefore = await page.evaluate(async () => {
          return document.querySelector('span').id
        }),
        expectedBefore = 'stub-0'

  assert.is(valueBefore, expectedBefore)

  const valueAfter = await page.evaluate(async () => {
          window.testState.count.value++
          await window.nextTick()
          return document.querySelector('span').id
        }),
        expectedAfter = 'stub-1'

  assert.is(valueAfter, expectedAfter)
})

suite('binds value getter to element', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindAttributeOrProperty/elementValueGetter')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return document.querySelector('span').id
        }),
        expected = 'stub'

  assert.is(value, expected)
})

suite('handles camelCased aria attributes', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindAttributeOrProperty/elementAria')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return document.querySelector('span').getAttribute('aria-label')
        }),
        expected = 'stub'

  assert.is(value, expected)
})

suite('handles camelCased data attributes', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindAttributeOrProperty/elementData')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return document.querySelector('span').dataset.label
        }),
        expected = 'stub'

  assert.is(value, expected)
})

suite('binds static values to list', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindAttributeOrProperty/listStatic')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => ({ textContent: node.textContent, id: node.id }))
        }),
        expected = [
          { textContent: '0', id: 'stub' },
          { textContent: '1', id: 'stub' },
          { textContent: '2', id: 'stub' },
        ]

  assert.equal(value, expected)
})

suite('binds reactive values to list', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindAttributeOrProperty/listRef')
  await page.waitForSelector('span', { state: 'attached' })

  const expected: any = {}

  const from = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => ({ textContent: node.textContent, id: node.id }))
  })
  expected.from = [
    { textContent: '0', id: '0' },
    { textContent: '1', id: '0' },
    { textContent: '2', id: '0' },
  ]

  assert.equal(from, expected.from)

  await page.evaluate(async () => {
    window.testState.count.value++
    await window.nextTick()
  })

  const to = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => ({ textContent: node.textContent, id: node.id }))
  })
  expected.to = [
    { textContent: '0', id: '1' },
    { textContent: '1', id: '1' },
    { textContent: '2', id: '1' },
  ]

  assert.equal(to, expected.to)
})

suite('binds value getter to list', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindAttributeOrProperty/listValueGetter')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => ({ textContent: node.textContent, id: node.id }))
        }),
        expected = [
          { textContent: '0', id: '0' },
          { textContent: '1', id: '1' },
          { textContent: '2', id: '2' },
        ]

  assert.equal(value, expected)
})

suite('binds static values to plane', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindAttributeOrProperty/planeStatic')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => ({ textContent: node.textContent, id: node.id }))
        }),
        expected = [
          { textContent: '0,0', id: 'stub' },
          { textContent: '0,1', id: 'stub' },
          { textContent: '0,2', id: 'stub' },

          { textContent: '1,0', id: 'stub' },
          { textContent: '1,1', id: 'stub' },
          { textContent: '1,2', id: 'stub' },
        ]

  assert.equal(value, expected)
})

suite('binds reactive values to plane', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindAttributeOrProperty/planeRef')
  await page.waitForSelector('span', { state: 'attached' })

  const expected: any = {}

  const from = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => ({ textContent: node.textContent, id: node.id }))
  })
  expected.from = [
    { textContent: '0,0', id: '0' },
    { textContent: '0,1', id: '0' },
    { textContent: '0,2', id: '0' },
    { textContent: '1,0', id: '0' },
    { textContent: '1,1', id: '0' },
    { textContent: '1,2', id: '0' },
  ]

  assert.equal(from, expected.from)

  await page.evaluate(async () => {
    window.testState.count.value++
    await window.nextTick()
  })

  const to = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => ({ textContent: node.textContent, id: node.id }))
  })
  expected.to = [
    { textContent: '0,0', id: '1' },
    { textContent: '0,1', id: '1' },
    { textContent: '0,2', id: '1' },
    { textContent: '1,0', id: '1' },
    { textContent: '1,1', id: '1' },
    { textContent: '1,2', id: '1' },
  ]

  assert.equal(to, expected.to)
})

suite('binds value getter to plane', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/bindAttributeOrProperty/planeValueGetter')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => ({ textContent: node.textContent, id: node.id }))
        }),
        expected = [
          { textContent: '0,0', id: '00' },
          { textContent: '0,1', id: '01' },
          { textContent: '0,2', id: '02' },
          { textContent: '1,0', id: '10' },
          { textContent: '1,1', id: '11' },
          { textContent: '1,2', id: '12' },
        ]

  assert.equal(value, expected)
})


suite.run()
