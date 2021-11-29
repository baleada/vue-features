import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('createEnabledNavigation')
)

suite(`toNextPossible returns next possible when loops is false and there is a next possible`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/enabledNavigation/toNextPossible')
  await page.waitForSelector('ul')

  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextPossible({
            index: 0,
            toIsPossible: index => index === 2,
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toNextPossible returns next possible when loops is true and there is a next possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextPossible_loops({
            index: 3,
            toIsPossible: index => index === 2
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toNextPossible returns 'none' when loops is false and there is no next possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextPossible({
            index: 0,
            toIsPossible: index => index === -1
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toNextPossible returns 'none' when loops is true and there is no next possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextPossible_loops({
            index: 0,
            toIsPossible: index => index === -1
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toNextPossible finds next possible starting from impossible index`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextPossible({
            index: -1,
            toIsPossible: index => index === 0
          })
        }),
        expected = 0

  assert.is(value, expected)
})

suite(`toPreviousPossible returns previous possible when loops is false and there is a previous possible`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/enabledNavigation/toPreviousPossible')
  await page.waitForSelector('ul')

  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousPossible({
            index: 9,
            toIsPossible: index => index === 2,
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toPreviousPossible returns previous possible when loops is true and there is a previous possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousPossible_loops({
            index: 1,
            toIsPossible: index => index === 2
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toPreviousPossible returns 'none' when loops is false and there is no previous possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousPossible({
            index: 9,
            toIsPossible: index => index === -1
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toPreviousPossible returns 'none' when loops is true and there is no previous possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousPossible_loops({
            index: 9,
            toIsPossible: index => index === -1
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toPreviousPossible finds previous possible starting from impossible index`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousPossible({
            index: 10,
            toIsPossible: index => index === 9
          })
        }),
        expected = 9

  assert.is(value, expected)
})



suite.run()
