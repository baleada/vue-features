import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('createToEligible')
)

// NEXT ELIGIBLE
suite(`toNextEligible() returns next eligible when loops is false and there is a next eligible`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createToEligibleInList/next')
  await page.waitForSelector('ul')

  const value = await page.evaluate(() => {
          return window.testState.toNextEligible(
            0,
            index => index === 2 ? 'eligible' : 'ineligible'
          )
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toNextEligible() returns next eligible when loops is true and there is a next eligible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toNextEligible_loops(
            3,
            index => index === 2 ? 'eligible' : 'ineligible'
          )
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toNextEligible() returns 'none' when loops is false and there is no next eligible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toNextEligible(
            0,
            index => index === -1 ? 'eligible' : 'ineligible'
          )
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toNextEligible() returns 'none' when loops is true and there is no next eligible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toNextEligible_loops(
            0,
            index => index === -1 ? 'eligible' : 'ineligible'
          )
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toNextEligible() finds next eligible starting from ineligible index`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toNextEligible(
            -1,
            index => index === 0 ? 'eligible' : 'ineligible'
          )
        }),
        expected = 0

  assert.is(value, expected)
})


// PREVIOUS ELIGIBLE
suite(`toPreviousEligible() returns previous eligible when loops is false and there is a previous eligible`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createToEligibleInList/previous')
  await page.waitForSelector('ul')

  const value = await page.evaluate(() => {
          return window.testState.toPreviousEligible(
            9,
            index => index === 2 ? 'eligible' : 'ineligible'
          )
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toPreviousEligible() returns previous eligible when loops is true and there is a previous eligible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toPreviousEligible_loops(
            1,
            index => index === 2 ? 'eligible' : 'ineligible'
          )
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toPreviousEligible() returns 'none' when loops is false and there is no previous eligible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toPreviousEligible(
            9,
            index => index === -1 ? 'eligible' : 'ineligible'
          )
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toPreviousEligible() returns 'none' when loops is true and there is no previous eligible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toPreviousEligible_loops(
            9,
            index => index === -1 ? 'eligible' : 'ineligible'
          )
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toPreviousEligible() finds previous eligible starting from ineligible index`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toPreviousEligible(
            10,
            index => index === 9 ? 'eligible' : 'ineligible'
          )
        }),
        expected = 9

  assert.is(value, expected)
})

suite.run()
