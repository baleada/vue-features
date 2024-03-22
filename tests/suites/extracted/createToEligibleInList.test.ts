import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('createToEligible')
)

// NEXT ELIGIBLE
suite('toNextEligible(...) returns next eligible when loops is false and there is a next eligible', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createToEligibleInList/next')
  await page.waitForSelector('ul', { state: 'attached' })

  const value = await page.evaluate(() => {
          return window.testState.toNextEligible({
            index: 0,
            toEligibility: index => index === 2 ? 'eligible' : 'ineligible',
            loops: false,
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite('toNextEligible(...) returns next eligible when loops is true and there is a next eligible', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toNextEligible({
            index: 3,
            toEligibility: index => index === 2 ? 'eligible' : 'ineligible',
            loops: true,
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite('toNextEligible(...) returns \'none\' when loops is false and there is no next eligible', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toNextEligible({
            index: 0,
            toEligibility: index => index === -1 ? 'eligible' : 'ineligible',
            loops: false,
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite('toNextEligible(...) returns \'none\' when loops is true and there is no next eligible', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toNextEligible({
            index: 0,
            toEligibility: index => index === -1 ? 'eligible' : 'ineligible',
            loops: true,
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite('toNextEligible(...) finds next eligible starting from ineligible index', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toNextEligible({
            index: -1,
            toEligibility: index => index === 0 ? 'eligible' : 'ineligible',
            loops: false,
          })
        }),
        expected = 0

  assert.is(value, expected)
})

suite('toNextEligible(...) returns \'none\' when loops is false and index is last index', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toNextEligible({
            index: 9,
            toEligibility: () => 'eligible',
            loops: false,
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})


// PREVIOUS ELIGIBLE
suite('toPreviousEligible(...) returns previous eligible when loops is false and there is a previous eligible', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createToEligibleInList/previous')
  await page.waitForSelector('ul', { state: 'attached' })

  const value = await page.evaluate(() => {
          return window.testState.toPreviousEligible({
            index: 9,
            toEligibility: index => index === 2 ? 'eligible' : 'ineligible',
            loops: false,
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite('toPreviousEligible(...) returns previous eligible when loops is true and there is a previous eligible', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toPreviousEligible({
            index: 1,
            toEligibility: index => index === 2 ? 'eligible' : 'ineligible',
            loops: true,
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite('toPreviousEligible(...) returns \'none\' when loops is false and there is no previous eligible', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toPreviousEligible({
            index: 9,
            toEligibility: index => index === -1 ? 'eligible' : 'ineligible',
            loops: false,
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite('toPreviousEligible(...) returns \'none\' when loops is true and there is no previous eligible', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toPreviousEligible({
            index: 9,
            toEligibility: index => index === -1 ? 'eligible' : 'ineligible',
            loops: true,
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite('toPreviousEligible(...) finds previous eligible starting from ineligible index', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toPreviousEligible({
            index: 10,
            toEligibility: index => index === 9 ? 'eligible' : 'ineligible',
            loops: false,
          })
        }),
        expected = 9

  assert.is(value, expected)
})

suite('toPreviousEligible(...) returns \'none\' when loops is false and index is first index', async ({ playwright: { page } }) => {
  const value = await page.evaluate(() => {
          return window.testState.toPreviousEligible({
            index: 0,
            toEligibility: () => 'eligible',
            loops: false,
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite.run()
