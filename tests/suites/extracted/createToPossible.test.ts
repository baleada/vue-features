import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('createToPossible')
)

// NEXT POSSIBLE
suite(`toNextPossible() returns next possible when loops is false and there is a next possible`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/toPossible/next')
  await page.waitForSelector('ul')

  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextPossible({
            index: 0,
            toPossibility: ({ index }) => index === 2 ? 'possible' : 'impossible'
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toNextPossible() returns next possible when loops is true and there is a next possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextPossible_loops({
            index: 3,
            toPossibility: ({ index }) => index === 2 ? 'possible' : 'impossible'
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toNextPossible() returns 'none' when loops is false and there is no next possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextPossible({
            index: 0,
            toPossibility: ({ index }) => index === -1 ? 'possible' : 'impossible'
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toNextPossible() returns 'none' when loops is true and there is no next possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextPossible_loops({
            index: 0,
            toPossibility: ({ index }) => index === -1 ? 'possible' : 'impossible'
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toNextPossible() finds next possible starting from impossible index`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextPossible({
            index: -1,
            toPossibility: ({ index }) => index === 0 ? 'possible' : 'impossible'
          })
        }),
        expected = 0

  assert.is(value, expected)
})


// PREVIOUS POSSIBLE
suite(`toPreviousPossible() returns previous possible when loops is false and there is a previous possible`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/toPossible/previous')
  await page.waitForSelector('ul')

  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousPossible({
            index: 9,
            toPossibility: ({ index }) => index === 2 ? 'possible' : 'impossible'
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toPreviousPossible() returns previous possible when loops is true and there is a previous possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousPossible_loops({
            index: 1,
            toPossibility: ({ index }) => index === 2 ? 'possible' : 'impossible'
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toPreviousPossible() returns 'none' when loops is false and there is no previous possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousPossible({
            index: 9,
            toPossibility: ({ index }) => index === -1 ? 'possible' : 'impossible'
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toPreviousPossible() returns 'none' when loops is true and there is no previous possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousPossible_loops({
            index: 9,
            toPossibility: ({ index }) => index === -1 ? 'possible' : 'impossible'
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toPreviousPossible() finds previous possible starting from impossible index`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousPossible({
            index: 10,
            toPossibility: ({ index }) => index === 9 ? 'possible' : 'impossible'
          })
        }),
        expected = 9

  assert.is(value, expected)
})

suite.run()
