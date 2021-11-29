import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('createToEligible')
)

// NEXT POSSIBLE
suite(`toNextEligible() returns next possible when loops is false and there is a next possible`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/toEligible/next')
  await page.waitForSelector('ul')

  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextEligible({
            index: 0,
            toEligibility: ({ index }) => index === 2 ? 'eligible' : 'ineligible'
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toNextEligible() returns next possible when loops is true and there is a next possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextEligible_loops({
            index: 3,
            toEligibility: ({ index }) => index === 2 ? 'eligible' : 'ineligible'
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toNextEligible() returns 'none' when loops is false and there is no next possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextEligible({
            index: 0,
            toEligibility: ({ index }) => index === -1 ? 'eligible' : 'ineligible'
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toNextEligible() returns 'none' when loops is true and there is no next possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextEligible_loops({
            index: 0,
            toEligibility: ({ index }) => index === -1 ? 'eligible' : 'ineligible'
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toNextEligible() finds next possible starting from impossible index`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextEligible({
            index: -1,
            toEligibility: ({ index }) => index === 0 ? 'eligible' : 'ineligible'
          })
        }),
        expected = 0

  assert.is(value, expected)
})


// PREVIOUS POSSIBLE
suite(`toPreviousEligible() returns previous possible when loops is false and there is a previous possible`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/toEligible/previous')
  await page.waitForSelector('ul')

  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousEligible({
            index: 9,
            toEligibility: ({ index }) => index === 2 ? 'eligible' : 'ineligible'
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toPreviousEligible() returns previous possible when loops is true and there is a previous possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousEligible_loops({
            index: 1,
            toEligibility: ({ index }) => index === 2 ? 'eligible' : 'ineligible'
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toPreviousEligible() returns 'none' when loops is false and there is no previous possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousEligible({
            index: 9,
            toEligibility: ({ index }) => index === -1 ? 'eligible' : 'ineligible'
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toPreviousEligible() returns 'none' when loops is true and there is no previous possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousEligible_loops({
            index: 9,
            toEligibility: ({ index }) => index === -1 ? 'eligible' : 'ineligible'
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toPreviousEligible() finds previous possible starting from impossible index`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousEligible({
            index: 10,
            toEligibility: ({ index }) => index === 9 ? 'eligible' : 'ineligible'
          })
        }),
        expected = 9

  assert.is(value, expected)
})

suite.run()
