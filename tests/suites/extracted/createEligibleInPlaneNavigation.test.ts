import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('createEligibleInPlaneNavigation')
)

// VALUE GETTER
suite.only(`exact() works with value getter ability`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInPlaneNavigation/abilityGetter')
  await page.waitForSelector('div')

  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.exact(9, 9),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.exact(3, 3),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 3, column: 3 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.first())
})

suite.only(`first() works with value getter ability`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          ;(window as unknown as WithGlobals).testState.rows.value.navigate(9)
          ;(window as unknown as WithGlobals).testState.columns.value.navigate(9)

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.first(),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        expected = { ability: 'enabled', row: 0, column: 2 }

  assert.equal(value, expected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.first())
})

suite.only(`last() works with value getter ability`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.last(),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        expected = { ability: 'enabled', row: 9, column: 7 }

  assert.equal(value, expected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.first())
})

suite.only(`nextInRow() works with value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.nextInRow(0, 7),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.nextInRow(0, 3),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 0, column: 4 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.first())
})

suite.only(`nextInColumn() works with value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.nextInColumn(0, 0),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.nextInColumn(0, 2),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 1, column: 2 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.first())
})

suite.only(`previousInRow() works with value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.previousInRow(0, 2),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.previousInRow(0, 5),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 0, column: 4 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.first())
})

suite.only(`previousInColumn() works with value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.previousInColumn(9, 0),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.previousInColumn(9, 2),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 8, column: 2 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.first())
})


// REACTIVE VALUE GETTER
suite.only(`exact() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInPlaneNavigation/abilityReactiveGetter')
  await page.waitForSelector('div')

  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.exact(9, 9),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.exact(0, 3),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 0, column: 3 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite.only(`first() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          ;(window as unknown as WithGlobals).testState.rows.value.navigate(9)
          ;(window as unknown as WithGlobals).testState.columns.value.navigate(9)

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.first(),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 9, column: 9 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.first(),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 0, column: 0 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite.only(`last() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.last(),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.last(),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 9, column: 9 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite.only(`nextInRow() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.nextInRow(0, 0),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.nextInRow(0, 0),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 0, column: 1 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite.only(`nextInColumn() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.nextInColumn(0, 0),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.nextInColumn(0, 0),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 1, column: 0 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite.only(`previousInRow() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.previousInRow(0, 2),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.previousInRow(0, 2),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 0, column: 1 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite.only(`previousInColumn() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.previousInColumn(2, 0),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.previousInColumn(2, 0),
                row = (window as unknown as WithGlobals).testState.rows.value.location,
                column = (window as unknown as WithGlobals).testState.columns.value.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 1, column: 0 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.rows.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.columns.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})


// REORDER AND REMOVE
suite(`navigates to located element's new location when elements are reordered`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInPlaneNavigation/abilityReactiveGetter')
  await page.waitForSelector('div')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.reorder()
          await (window as unknown as WithGlobals).nextTick()
          return {
            row: (window as unknown as WithGlobals).testState.rows.value.location,
            column: (window as unknown as WithGlobals).testState.columns.value.location,
          }
        }),
        expected = { row: 9, column: 9 }

  assert.equal(value, expected)
})

suite(`navigates to last in column when rows are removed and location is beyond the new end`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInPlaneNavigation/abilityReactiveGetter')
  await page.waitForSelector('div')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.rows.value.last()
          ;(window as unknown as WithGlobals).testState.removeRow()
          await (window as unknown as WithGlobals).nextTick()
          return {
            row: (window as unknown as WithGlobals).testState.rows.value.location,
            column: (window as unknown as WithGlobals).testState.columns.value.location,
          }
        }),
        expected = { row: 8, column: 0 }

  assert.equal(value, expected)
})

suite(`navigates to last in row when columns are removed and location is beyond the new end`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInPlaneNavigation/abilityReactiveGetter')
  await page.waitForSelector('div')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.columns.value.last()
          ;(window as unknown as WithGlobals).testState.removeColumn()
          await (window as unknown as WithGlobals).nextTick()
          return {
            row: (window as unknown as WithGlobals).testState.rows.value.location,
            column: (window as unknown as WithGlobals).testState.columns.value.location,
          }
        }),
        expected = { row: 0, column: 8 }

  assert.equal(value, expected)
})

suite(`navigates to first when elements are reordered and element at location is removed`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInPlaneNavigation/abilityReactiveGetter')
  await page.waitForSelector('div')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.removeAndReorder()
          await (window as unknown as WithGlobals).nextTick()
          return (window as unknown as WithGlobals).testState.navigateable.value.location
        }),
        expected = 0

  assert.is(value, expected)
})

suite.run()
