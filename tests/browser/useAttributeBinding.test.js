import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useAttributeBinding (browser)')
)

suite(`binds static values to attributes`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useAttributeBinding/static')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return document.querySelector('span').id
        }),
        expected = 'stub'

  assert.is(value, expected)
})

suite(`binds dynamic values to attributes`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useAttributeBinding/dynamic')
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
  await page.goto('http://localhost:3000/useAttributeBinding/aria')
  await page.waitForSelector('span')

  const value = await page.evaluate(async () => {
          return document.querySelector('span').getAttribute('aria-label')
        }),
        expected = 'stub'

  assert.is(value, expected)
})

suite(`binds static values to attributes on arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useAttributeBinding/staticGrowingArray')
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
  await page.goto('http://localhost:3000/useAttributeBinding/dynamicGrowingArray')
  await page.waitForSelector('span')

  const expected = {}

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
    window.TEST.increaseCount()
    await window.nextTick()
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

suite(`binds values via the element closure to attributes on arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useAttributeBinding/elementClosureGrowingArray')
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
  await page.goto('http://localhost:3000/useAttributeBinding/staticGrowingArray')
  await page.waitForSelector('span')

  await page.evaluate(async () => {
    window.TEST.add()
    await window.nextTick()
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
  await page.goto('http://localhost:3000/useAttributeBinding/dynamicGrowingArray')
  await page.waitForSelector('span')

  const expected = {}

  await page.evaluate(async () => {
    window.TEST.add()
    await window.nextTick()
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
    window.TEST.increaseCount()
    await window.nextTick()
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

suite(`binds values via the element closure to attributes on growing arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useAttributeBinding/elementClosureGrowingArray')
  await page.waitForSelector('span')

  await page.evaluate(async () => {
    window.TEST.add()
    await window.nextTick()
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

suite(`binds values via the element closure to attributes on reordering arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useAttributeBinding/elementClosureGrowingArray')
  await page.waitForSelector('span')

  await page.evaluate(async () => {
    window.TEST.reorder()
    await window.nextTick()
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

suite(`binds values via the element closure to attributes on shrinking arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useAttributeBinding/elementClosureGrowingArray')
  await page.waitForSelector('span')

  await page.evaluate(async () => {
    window.TEST.del()
    await window.nextTick()
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
