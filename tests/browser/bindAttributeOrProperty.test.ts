import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../fixtures/types'

const suite = withPuppeteer(
  createSuite('bindAttributeOrProperty')
)

suite(`binds static values to attributes`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/bindAttributeOrProperty/static')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return document.querySelector('span').id
        }),
        expected = 'stub'

  assert.is(value, expected)
})

suite(`binds dynamic values to attributes`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/bindAttributeOrProperty/dynamic')
  await page.waitForSelector('span')

  const valueBefore = await page.evaluate(async () => {
          return document.querySelector('span').id
        }),
        expectedBefore = 'stub-0'
  
  assert.is(valueBefore, expectedBefore)
  
  await page.click('button')
  const valueAfter = await page.evaluate(async () => {
          return document.querySelector('span').id
        }),
        expectedAfter = 'stub-1'

  assert.is(valueAfter, expectedAfter)
})

suite(`handles camelCased aria attributes`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/bindAttributeOrProperty/aria')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return document.querySelector('span').getAttribute('aria-label')
        }),
        expected = 'stub'

  assert.is(value, expected)
})

suite(`handles camelCased data attributes`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/bindAttributeOrProperty/data')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return document.querySelector('span').getAttribute('data-label')
        }),
        expected = 'stub'

  assert.is(value, expected)
})

suite(`binds static values to attributes on arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/bindAttributeOrProperty/staticGrowingArray')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => (({ textContent, id }) => ({ textContent, id }))(node))
        }),
        expected = [
          { textContent: '0', id: 'stub' },
          { textContent: '1', id: 'stub' },
          { textContent: '2', id: 'stub' },
          { textContent: '3', id: 'stub' },
        ]

  assert.equal(value, expected)
})

suite(`binds dynamic values to attributes on arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/bindAttributeOrProperty/dynamicGrowingArray')
  await page.waitForSelector('span')

  const expected: any = {}

  const from = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => (({ textContent, id }) => ({ textContent, id }))(node))
  })
  expected.from = [
    { textContent: '0', id: '0' },
    { textContent: '1', id: '0' },
    { textContent: '2', id: '0' },
    { textContent: '3', id: '0' },
  ]

  assert.equal(from, expected.from)

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.increaseCount()
    await (window as unknown as WithGlobals).nextTick()
  })

  const to = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => (({ textContent, id }) => ({ textContent, id }))(node))
  })
  expected.to = [
    { textContent: '0', id: '1' },
    { textContent: '1', id: '1' },
    { textContent: '2', id: '1' },
    { textContent: '3', id: '1' },
  ]

  assert.equal(to, expected.to)
})

suite(`binds values via toValue to attributes on arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/bindAttributeOrProperty/toValueGrowingArray')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => (({ textContent, id }) => ({ textContent, id }))(node))
        }),
        expected = [
          { textContent: '0', id: '0' },
          { textContent: '1', id: '1' },
          { textContent: '2', id: '2' },
          { textContent: '3', id: '3' },
        ]

  assert.equal(value, expected)
})

suite(`binds static values to attributes on growing arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/bindAttributeOrProperty/staticGrowingArray')
  await page.waitForSelector('span')

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.add()
    await (window as unknown as WithGlobals).nextTick()
  })

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => (({ textContent, id }) => ({ textContent, id }))(node))
        }),
        expected = [
          { textContent: '0', id: 'stub' },
          { textContent: '1', id: 'stub' },
          { textContent: '2', id: 'stub' },
          { textContent: '3', id: 'stub' },
          { textContent: '4', id: 'stub' },
        ]

  assert.equal(value, expected)
})

suite(`binds dynamic values to attributes on growing arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/bindAttributeOrProperty/dynamicGrowingArray')
  await page.waitForSelector('span')

  const expected: any = {}

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.add()
    await (window as unknown as WithGlobals).nextTick()
  })

  const from = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => (({ textContent, id }) => ({ textContent, id }))(node))
  })
  expected.from = [
    { textContent: '0', id: '0' },
    { textContent: '1', id: '0' },
    { textContent: '2', id: '0' },
    { textContent: '3', id: '0' },
    { textContent: '4', id: '0' },
  ]

  assert.equal(from, expected.from)

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.increaseCount()
    await (window as unknown as WithGlobals).nextTick()
  })

  const to = await page.evaluate(async () => {
    return [...document.querySelectorAll('span')]
      .map(node => (({ textContent, id }) => ({ textContent, id }))(node))
  })
  expected.to = [
    { textContent: '0', id: '1' },
    { textContent: '1', id: '1' },
    { textContent: '2', id: '1' },
    { textContent: '3', id: '1' },
    { textContent: '4', id: '1' },
  ]

  assert.equal(to, expected.to)
})

suite(`binds values via toValue to attributes on growing arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/bindAttributeOrProperty/toValueGrowingArray')
  await page.waitForSelector('span')

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.add()
    await (window as unknown as WithGlobals).nextTick()
  })

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => (({ textContent, id }) => ({ textContent, id }))(node))
        }),
        expected = [
          { textContent: '0', id: '0' },
          { textContent: '1', id: '1' },
          { textContent: '2', id: '2' },
          { textContent: '3', id: '3' },
          { textContent: '4', id: '4' },
        ]

  assert.equal(value, expected)
})

suite(`binds values via toValue to attributes on reordering arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/bindAttributeOrProperty/toValueGrowingArray')
  await page.waitForSelector('span')

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.reorder()
    await (window as unknown as WithGlobals).nextTick()
  })

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => (({ textContent, id }) => ({ textContent, id }))(node))
        }),
        expected = [
          { textContent: '0', id: '0' },
          { textContent: '2', id: '2' },
          { textContent: '1', id: '1' },
          { textContent: '3', id: '3' },
        ]

  assert.equal(value, expected)
})

suite(`binds values via toValue to attributes on shrinking arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/bindAttributeOrProperty/toValueGrowingArray')
  await page.waitForSelector('span')

  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.del()
    await (window as unknown as WithGlobals).nextTick()
  })

  const value = await page.evaluate(async () => {
          return [...document.querySelectorAll('span')]
            .map(node => (({ textContent, id }) => ({ textContent, id }))(node))
        }),
        expected = [
          { textContent: '0', id: '0' },
          { textContent: '2', id: '2' },
          { textContent: '3', id: '3' },
        ]

  assert.equal(value, expected)
})

suite.run()
