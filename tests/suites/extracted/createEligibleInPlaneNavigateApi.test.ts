import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('createEligibleInPlaneNavigateApi')
)

// VALUE GETTER
suite.only('exact() works with value getter ability', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInPlaneNavigateApi/abilityGetter')
  await page.waitForSelector('div', { state: 'attached' })

  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.exact({ row: 9, column: 9 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.exact({ row: 3, column: 3 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 3, column: 3 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.first())
  await page.evaluate(() => window.testState.columns.first())
})

suite.only('first() works with value getter ability', async ({ playwright: { page } }) => {
  const value = await page.evaluate(async () => {
          window.testState.rows.navigate(9)
          window.testState.columns.navigate(9)

          const ability = window.testState.eligibleNavigateApi.first(),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        expected = { ability: 'enabled', row: 0, column: 2 }

  assert.equal(value, expected)

  await page.evaluate(() => window.testState.rows.first())
  await page.evaluate(() => window.testState.columns.first())
})

suite.only('last() works with value getter ability', async ({ playwright: { page } }) => {
  const value = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.last(),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        expected = { ability: 'enabled', row: 9, column: 7 }

  assert.equal(value, expected)

  await page.evaluate(() => window.testState.rows.first())
  await page.evaluate(() => window.testState.columns.first())
})

suite.only('nextInRow() works with value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.nextInRow({ row: 0, column: 7 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.nextInRow({ row: 0, column: 3 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 0, column: 4 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.first())
  await page.evaluate(() => window.testState.columns.first())
})

suite.only('nextInColumn() works with value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.nextInColumn({ row: 0, column: 0 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.nextInColumn({ row: 0, column: 2 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 1, column: 2 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.first())
  await page.evaluate(() => window.testState.columns.first())
})

suite.only('previousInRow() works with value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.previousInRow({ row: 0, column: 2 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.previousInRow({ row: 0, column: 5 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 0, column: 4 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.first())
  await page.evaluate(() => window.testState.columns.first())
})

suite.only('previousInColumn() works with value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.previousInColumn({ row: 9, column: 0 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.previousInColumn({ row: 9, column: 2 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 8, column: 2 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.first())
  await page.evaluate(() => window.testState.columns.first())
})


// REACTIVE VALUE GETTER
suite.only('exact() works with reactive value getter ability', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInPlaneNavigateApi/abilityReactiveGetter')
  await page.waitForSelector('div', { state: 'attached' })

  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.exact({ row: 9, column: 9 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.exact({ row: 0, column: 3 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 0, column: 3 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.first())
  await page.evaluate(() => window.testState.columns.first())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite.only('first() works with reactive value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          window.testState.rows.navigate(9)
          window.testState.columns.navigate(9)

          const ability = window.testState.eligibleNavigateApi.first(),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 9, column: 9 }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.first(),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 0, column: 0 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.first())
  await page.evaluate(() => window.testState.columns.first())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite.only('last() works with reactive value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.last(),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.last(),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 9, column: 9 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.first())
  await page.evaluate(() => window.testState.columns.first())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite.only('nextInRow() works with reactive value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.nextInRow({ row: 0, column: 0 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.nextInRow({ row: 0, column: 0 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 0, column: 1 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.first())
  await page.evaluate(() => window.testState.columns.first())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite.only('nextInColumn() works with reactive value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.nextInColumn({ row: 0, column: 0 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.nextInColumn({ row: 0, column: 0 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 1, column: 0 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.first())
  await page.evaluate(() => window.testState.columns.first())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite.only('previousInRow() works with reactive value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.previousInRow({ row: 0, column: 2 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.previousInRow({ row: 0, column: 2 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 0, column: 1 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.first())
  await page.evaluate(() => window.testState.columns.first())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite.only('previousInColumn() works with reactive value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.previousInColumn({ row: 2, column: 0 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        disabledExpected = { ability: 'none', row: 0, column: 0 }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.previousInColumn({ row: 2, column: 0 }),
                row = window.testState.rows.location,
                column = window.testState.columns.location

          return { ability, row, column }
        }),
        enabledExpected = { ability: 'enabled', row: 1, column: 0 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.first())
  await page.evaluate(() => window.testState.columns.first())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})


// REORDER AND REMOVE
suite('navigates to located element\'s new location when elements are reordered', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInPlaneNavigateApi/abilityReactiveGetter')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))

  const value = await page.evaluate(async () => {
          window.testState.reorder()
          await window.nextTick()
          return {
            row: window.testState.rows.location,
            column: window.testState.columns.location,
          }
        }),
        expected = { row: 9, column: 9 }

  assert.equal(value, expected)
})

suite('navigates to last in column when rows are removed and location is beyond the new end', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInPlaneNavigateApi/abilityReactiveGetter')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))

  const value = await page.evaluate(async () => {
          window.testState.rows.last()
          window.testState.removeRow()
          await window.nextTick()
          return {
            row: window.testState.rows.location,
            column: window.testState.columns.location,
          }
        }),
        expected = { row: 8, column: 0 }

  assert.equal(value, expected)
})

suite('navigates to last in row when columns are removed and location is beyond the new end', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInPlaneNavigateApi/abilityReactiveGetter')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))

  const value = await page.evaluate(async () => {
          window.testState.columns.last()
          window.testState.removeColumn()
          await window.nextTick()
          return {
            row: window.testState.rows.location,
            column: window.testState.columns.location,
          }
        }),
        expected = { row: 0, column: 8 }

  assert.equal(value, expected)
})

suite('navigates to first when elements are reordered and element at location is removed', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInPlaneNavigateApi/abilityReactiveGetter')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))

  const value = await page.evaluate(async () => {
          window.testState.removeAndReorder()
          await window.nextTick()
          return window.testState.navigateable.location
        }),
        expected = 0

  assert.is(value, expected)
})

suite.run()
