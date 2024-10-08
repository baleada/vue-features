import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('createToEligible')
)

// NEXT ELIGIBLE
suite('toNextEligible(...) returns next eligible when loops is false and there is a next eligible', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createToEligibleInPlane/next')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(() => {
          return window.testState.toNextEligible({
            coordinates: { row: 0, column: 0 },
            toEligibility: ({ row, column }) => row === 1 && column === 2 ? 'eligible' : 'ineligible',
            direction: 'horizontal',
            loops: false,
          })
        }),
        expected = { row: 1, column: 2 }

  assert.equal(value, expected)
})

suite('toNextEligible(...) returns next eligible when loops is true and there is a next eligible', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toNextEligible({
            coordinates: { row: 1, column: 3 },
            toEligibility: ({ row, column }) => row === 0 && column === 2 ? 'eligible' : 'ineligible',
            direction: 'horizontal',
            loops: true,
          })
        }),
        expected = { row: 0, column: 2 }

  assert.equal(value, expected)
})

suite('toNextEligible(...) returns \'none\' when loops is false and there is no next eligible', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toNextEligible({
            coordinates: { row: 0, column: 0 },
            toEligibility: ({ row, column }) => row === -1 && column === -1 ? 'eligible' : 'ineligible',
            direction: 'horizontal',
            loops: false,
          })
        }),
        expected = 'none'

  assert.equal(value, expected)
})

suite('toNextEligible(...) returns \'none\' when loops is true and there is no next eligible', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toNextEligible({
            coordinates: { row: 0, column: 0 },
            toEligibility: ({ row, column }) => row === -1 && column === -1 ? 'eligible' : 'ineligible',
            direction: 'horizontal',
            loops: true,
          })
        }),
        expected = 'none'

  assert.equal(value, expected)
})

suite('toNextEligible(...) finds next eligible starting from ineligible index', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toNextEligible({
            coordinates: { row: -1, column: -1 },
            toEligibility: ({ row, column }) => row === 0 && column === 0 ? 'eligible' : 'ineligible',
            direction: 'horizontal',
            loops: false,
          })
        }),
        expected = { row: 0, column: 0 }

  assert.equal(value, expected)
})

suite('toNextEligible(...) works in vertical direction', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toNextEligible({
            coordinates: { row: 0, column: 3 },
            toEligibility: ({ row }) => row === 3 ? 'eligible' : 'ineligible',
            direction: 'vertical',
            loops: false,
          })
        }),
        expected = { row: 3, column: 3 }

  assert.equal(value, expected)
})

suite('toNextEligible returns \'none\' when loops is false and coordinates are last coordinates', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toNextEligible({
            coordinates: { row: 9, column: 9 },
            toEligibility: () => 'eligible',
            direction: 'horizontal',
            loops: false,
          })
        }),
        expected = 'none'

  assert.equal(value, expected)
})


// PREVIOUS ELIGIBLE
suite('toPreviousEligible(...) returns previous eligible when loops is false and there is a previous eligible', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createToEligibleInPlane/previous')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(() => {
          return window.testState.toPreviousEligible({
            coordinates: { row: 9, column: 9 },
            toEligibility: ({ row, column }) => row === 1 && column === 2 ? 'eligible' : 'ineligible',
            direction: 'horizontal',
            loops: false,
          })
        }),
        expected = { row: 1, column: 2 }

  assert.equal(value, expected)
})

suite('toPreviousEligible(...) returns previous eligible when loops is true and there is a previous eligible', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toPreviousEligible({
            coordinates: { row: 0, column: 1 },
            toEligibility: ({ row, column }) => row === 1 && column === 3 ? 'eligible' : 'ineligible',
            direction: 'horizontal',
            loops: true,
          })
        }),
        expected = { row: 1, column: 3 }

  assert.equal(value, expected)
})

suite('toPreviousEligible(...) returns \'none\' when loops is false and there is no previous eligible', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toPreviousEligible({
            coordinates: { row: 9, column: 9 },
            toEligibility: ({ row, column }) => row === -1 && column === -1 ? 'eligible' : 'ineligible',
            direction: 'horizontal',
            loops: false,
          })
        }),
        expected = 'none'

  assert.equal(value, expected)
})

suite('toPreviousEligible(...) returns \'none\' when loops is true and there is no previous eligible', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toPreviousEligible({
            coordinates: { row: 9, column: 9 },
            toEligibility: ({ row, column }) => row === -1 && column === -1 ? 'eligible' : 'ineligible',
            direction: 'horizontal',
            loops: true,
          })
        }),
        expected = 'none'

  assert.equal(value, expected)
})

suite('toPreviousEligible(...) finds previous eligible starting from ineligible index', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toPreviousEligible({
            coordinates: { row: 10, column: 10 },
            toEligibility: ({ row, column }) => row === 9 && column === 9 ? 'eligible' : 'ineligible',
            direction: 'horizontal',
            loops: false,
          })
        }),
        expected = { row: 9, column: 9 }

  assert.equal(value, expected)
})

suite('toPreviousEligible(...) works in vertical direction', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toPreviousEligible({
            coordinates: { row: 8, column: 3 },
            toEligibility: ({ row }) => row === 2 ? 'eligible' : 'ineligible',
            direction: 'vertical',
            loops: false,
          })
        }),
        expected = { row: 2, column: 3 }

  assert.equal(value, expected)
})

suite('toPreviousEligible returns \'none\' when loops is false and coordinates are first coordinates', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toPreviousEligible({
            coordinates: { row: 0, column: 0 },
            toEligibility: () => 'eligible',
            direction: 'horizontal',
            loops: false,
          })
        }),
        expected = 'none'

  assert.equal(value, expected)
})

suite.run()
