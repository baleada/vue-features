import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('createToEligible')
)

// NEXT ELIGIBLE
suite(`toNextEligible() returns next eligible when loops is false and there is a next eligible`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createToEligibleInPlane/next')
  await page.waitForSelector('div')

  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextEligible(
            0, 0,
            (row, column) => column === 2 ? 'eligible' : 'ineligible'
          )
        }),
        expected = [0, 2]

  assert.equal(value, expected)
})

suite(`toNextEligible() returns next eligible when loops is true and there is a next eligible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextEligible_loops(
            0, 3,
            (row, column) => column === 2 ? 'eligible' : 'ineligible'
          )
        }),
        expected = [0, 2]

  assert.equal(value, expected)
})

suite(`toNextEligible() returns 'none' when loops is false and there is no next eligible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextEligible(
            0, 0,
            (row, column) => column === -1 ? 'eligible' : 'ineligible'
          )
        }),
        expected = 'none'

  assert.equal(value, expected)
})

suite(`toNextEligible() returns 'none' when loops is true and there is no next eligible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextEligible_loops(
            0, 0,
            (row, column) => column === -1 ? 'eligible' : 'ineligible'
          )
        }),
        expected = 'none'

  assert.equal(value, expected)
})

suite(`toNextEligible() finds next eligible starting from ineligible index`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextEligible(
            0, -1,
            (row, column) => column === 0 ? 'eligible' : 'ineligible'
          )
        }),
        expected = [0, 0]

  assert.equal(value, expected)
})

suite(`toNextEligible() works in row direction`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextEligible_row(
            0, 3,
            (row, column) => row === 3 ? 'eligible' : 'ineligible'
          )
        }),
        expected = [3, 3]

  assert.equal(value, expected)
})


// PREVIOUS ELIGIBLE
suite(`toPreviousEligible() returns previous eligible when loops is false and there is a previous eligible`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createToEligibleInPlane/previous')
  await page.waitForSelector('div')

  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousEligible(
            0, 9,
            (row, column) => column === 2 ? 'eligible' : 'ineligible'
          )
        }),
        expected = [0, 2]

  assert.equal(value, expected)
})

suite(`toPreviousEligible() returns previous eligible when loops is true and there is a previous eligible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousEligible_loops(
            0, 1,
            (row, column) => column === 2 ? 'eligible' : 'ineligible'
          )
        }),
        expected = [0, 2]

  assert.equal(value, expected)
})

suite(`toPreviousEligible() returns 'none' when loops is false and there is no previous eligible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousEligible(
            0, 9,
            (row, column) => column === -1 ? 'eligible' : 'ineligible'
          )
        }),
        expected = 'none'

  assert.equal(value, expected)
})

suite(`toPreviousEligible() returns 'none' when loops is true and there is no previous eligible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousEligible_loops(
            0, 9,
            (row, column) => column === -1 ? 'eligible' : 'ineligible'
          )
        }),
        expected = 'none'

  assert.equal(value, expected)
})

suite(`toPreviousEligible() finds previous eligible starting from ineligible index`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousEligible(
            0, 10,
            (row, column) => column === 9 ? 'eligible' : 'ineligible'
          )
        }),
        expected = [0, 9]

  assert.equal(value, expected)
})

suite(`toPreviousEligible() works in row direction`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousEligible_row(
            8, 3,
            (row, column) => row === 2 ? 'eligible' : 'ineligible'
          )
        }),
        expected = [2, 3]

  assert.equal(value, expected)
})

suite.run()
