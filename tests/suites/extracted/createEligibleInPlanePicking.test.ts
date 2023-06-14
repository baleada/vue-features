import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('createEligibeInPlanePicking')
)

// VALUE GETTER
suite(`exact() works with value getter ability`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInPlanePicking/abilityGetter')
  await page.waitForSelector('div')

  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePicking.exact(0, 9),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligiblePicking.exact(0, 3),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [0], columns: [3] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.value.omit())
  await page.evaluate(() => window.testState.columns.value.omit())
})

suite(`nextInRow() works with value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePicking.nextInRow(0, 7),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligiblePicking.nextInRow(0, 3),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [0], columns: [4] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.value.omit())
  await page.evaluate(() => window.testState.columns.value.omit())
})

suite(`nextInColumn() works with value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePicking.nextInColumn(0, 9),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligiblePicking.nextInColumn(0, 3),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [1], columns: [3] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.value.omit())
  await page.evaluate(() => window.testState.columns.value.omit())
})

suite(`previousInRow() works with value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePicking.previousInRow(0, 2),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligiblePicking.previousInRow(0, 5),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [0], columns: [4] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.value.omit())
  await page.evaluate(() => window.testState.columns.value.omit())
})

suite(`previousInColumn() works with value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePicking.previousInColumn(1, 9),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligiblePicking.previousInColumn(1, 2),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [0], columns: [2] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.value.omit())
  await page.evaluate(() => window.testState.columns.value.omit())
})


// REACTIVE VALUE GETTER
suite(`exact() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInPlanePicking/abilityReactiveGetter')
  await page.waitForSelector('div')

  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePicking.exact(9),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await window.nextTick()

          const ability = window.testState.eligiblePicking.exact(0, 0),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [0], columns: [0] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.value.omit())
  await page.evaluate(() => window.testState.columns.value.omit())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite(`nextInRow() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePicking.nextInRow(0, 0),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await window.nextTick()

          const ability = window.testState.eligiblePicking.nextInRow(0, 0),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [0], columns: [1] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.value.omit())
  await page.evaluate(() => window.testState.columns.value.omit())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite(`nextInColumn() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePicking.nextInColumn(0, 0),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await window.nextTick()

          const ability = window.testState.eligiblePicking.nextInColumn(0, 0),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [1], columns: [0] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.value.omit())
  await page.evaluate(() => window.testState.columns.value.omit())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite(`previousInRow() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePicking.previousInRow(0, 1),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await window.nextTick()

          const ability = window.testState.eligiblePicking.previousInRow(0, 1),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [0], columns: [0] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.value.omit())
  await page.evaluate(() => window.testState.columns.value.omit())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite(`previousInRow() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePicking.previousInColumn(1, 0),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await window.nextTick()

          const ability = window.testState.eligiblePicking.previousInColumn(1, 0),
                rows = [...window.testState.rows.value.picks],
                columns = [...window.testState.columns.value.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [0], columns: [0] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.value.omit())
  await page.evaluate(() => window.testState.columns.value.omit())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

// REORDER AND REMOVE
suite.skip(`picks picked element's new location when elements are reordered`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInPlanePicking/abilityReactiveGetter')
  await page.waitForSelector('div')

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))

  const value = await page.evaluate(async () => {
          window.testState.pickable.value.pick(0)
          window.testState.reorder()
          await window.nextTick()
          return [...window.testState.pickable.value.picks]
        }),
        expected = [9]

  assert.equal(value, expected)
})

suite.skip(`omits when elements are removed and location is beyond the new end`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInPlanePicking/abilityReactiveGetter')
  await page.waitForSelector('div')

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))
  
  const value = await page.evaluate(async () => {
          window.testState.pickable.value.pick(9)  
          window.testState.remove()
          await window.nextTick()
          return [...window.testState.pickable.value.picks]
        }),
        expected = []

  assert.equal(value, expected)
})


// ABILITY CHANGE
suite.skip(`omits disabled when reactive value getter watch source changes`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInPlanePicking/abilityReactiveGetter')
  await page.waitForSelector('div')

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))
  
  const value = await page.evaluate(async () => {
          window.testState.pickable.value.pick(new Array(10).fill(0).map((_, index) => index))  
          window.testState.abilities.value = new Array(10).fill(0).map((_, index) => index % 2 === 0 ? 'enabled' : 'disabled')
          await window.nextTick()
          return [...window.testState.pickable.value.picks]
        }),
        expected = [0, 2, 4, 6, 8]

  assert.equal(value, expected)
})

suite.run()
