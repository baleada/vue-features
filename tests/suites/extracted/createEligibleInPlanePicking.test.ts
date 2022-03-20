import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('createEligibeInPlanePicking')
)

// VALUE GETTER
suite.only(`exact() works with value getter ability`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/createEligibleInPlanePicking/get')
  await page.waitForSelector('div')

  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.exact(0, 9),
                rows = [...(window as unknown as WithGlobals).testState.rows.value.picks],
                columns = [...(window as unknown as WithGlobals).testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.exact(0, 3),
                rows = [...(window as unknown as WithGlobals).testState.rows.value.picks],
                columns = [...(window as unknown as WithGlobals).testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [0], columns: [3] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.omit())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.omit())
})

suite.only(`nextInRow() works with value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.next(0, 7),
                rows = [...(window as unknown as WithGlobals).testState.rows.value.picks],
                columns = [...(window as unknown as WithGlobals).testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.next(3),
                rows = [...(window as unknown as WithGlobals).testState.rows.value.picks],
                columns = [...(window as unknown as WithGlobals).testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', picks: [4] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.omit())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.omit())
})

suite(`previous() works with value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.previous(2),
                rows = [...(window as unknown as WithGlobals).testState.rows.value.picks],
                columns = [...(window as unknown as WithGlobals).testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.previous(5),
                rows = [...(window as unknown as WithGlobals).testState.rows.value.picks],
                columns = [...(window as unknown as WithGlobals).testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', picks: [4] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.omit())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.omit())
})


// REACTIVE VALUE GETTER
suite(`exact() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/createEligibleInPlanePicking/getFromWatchSource')
  await page.waitForSelector('div')

  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.exact(9),
                rows = [...(window as unknown as WithGlobals).testState.rows.value.picks],
                columns = [...(window as unknown as WithGlobals).testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled')

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.exact(3),
                rows = [...(window as unknown as WithGlobals).testState.rows.value.picks],
                columns = [...(window as unknown as WithGlobals).testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', picks: [3] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.omit())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.omit())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('disabled'))
})

suite(`next() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.next(0),
                rows = [...(window as unknown as WithGlobals).testState.rows.value.picks],
                columns = [...(window as unknown as WithGlobals).testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled')

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.next(0),
                rows = [...(window as unknown as WithGlobals).testState.rows.value.picks],
                columns = [...(window as unknown as WithGlobals).testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', picks: [1] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.omit())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.omit())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('disabled'))
})

suite(`previous() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.previous(2),
                rows = [...(window as unknown as WithGlobals).testState.rows.value.picks],
                columns = [...(window as unknown as WithGlobals).testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled')

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.previous(2),
                rows = [...(window as unknown as WithGlobals).testState.rows.value.picks],
                columns = [...(window as unknown as WithGlobals).testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', picks: [1] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.omit())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.omit())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('disabled'))
})

// REORDER AND REMOVE
suite(`picks picked element's new location when elements are reordered`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/createEligibleInPlanePicking/getFromWatchSource')
  await page.waitForSelector('div')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled'))

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.pickable.value.pick(0)
          ;(window as unknown as WithGlobals).testState.reorder()
          await (window as unknown as WithGlobals).nextTick()
          return [...(window as unknown as WithGlobals).testState.pickable.value.picks]
        }),
        expected = [9]

  assert.equal(value, expected)
})

suite(`omits when elements are removed and location is beyond the new end`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/createEligibleInPlanePicking/getFromWatchSource')
  await page.waitForSelector('div')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled'))
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.pickable.value.pick(9)  
          ;(window as unknown as WithGlobals).testState.remove()
          await (window as unknown as WithGlobals).nextTick()
          return [...(window as unknown as WithGlobals).testState.pickable.value.picks]
        }),
        expected = []

  assert.equal(value, expected)
})


// ABILITY CHANGE
suite(`omits disabled when reactive value getter watch source changes`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/createEligibleInPlanePicking/getFromWatchSource')
  await page.waitForSelector('div')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled'))
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.pickable.value.pick(new Array(10).fill(0).map((_, index) => index))  
          ;(window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(0).map((_, index) => index % 2 === 0 ? 'enabled' : 'disabled')
          await (window as unknown as WithGlobals).nextTick()
          return [...(window as unknown as WithGlobals).testState.pickable.value.picks]
        }),
        expected = [0, 2, 4, 6, 8]

  assert.equal(value, expected)
})

suite.run()
