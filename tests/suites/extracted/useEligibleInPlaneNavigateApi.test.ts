import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useEligibleInPlaneNavigateApi')
)

// STATIC ABILITY
suite('exact() works with static ability', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useEligibleInPlaneNavigateApi/abilityStatic')
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

suite('first() works with static ability', async ({ playwright: { page } }) => {
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

suite('last() works with static ability', async ({ playwright: { page } }) => {
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

suite('nextInRow() works with static ability', async ({ playwright: { page } }) => {
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

suite('nextInColumn() works with static ability', async ({ playwright: { page } }) => {
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

suite('previousInRow() works with static ability', async ({ playwright: { page } }) => {
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

suite('previousInColumn() works with static ability', async ({ playwright: { page } }) => {
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


// REACTIVE ABILITY
suite('exact() works with reactive ability', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useEligibleInPlaneNavigateApi/abilityReactive')
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

suite('first() works with reactive ability', async ({ playwright: { page } }) => {
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

suite('last() works with reactive ability', async ({ playwright: { page } }) => {
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

suite('nextInRow() works with reactive ability', async ({ playwright: { page } }) => {
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

suite('nextInColumn() works with reactive ability', async ({ playwright: { page } }) => {
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

suite('previousInRow() works with reactive ability', async ({ playwright: { page } }) => {
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

suite('previousInColumn() works with reactive ability', async ({ playwright: { page } }) => {
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
suite('navigates to located element\'s new location when rows are reordered', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useEligibleInPlaneNavigateApi/abilityReactive')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))

  const value = await page.evaluate(async () => {
          window.testState.reorderRows()
          await window.nextTick()
          return {
            row: window.testState.rows.location,
            column: window.testState.columns.location,
          }
        }),
        expected = { row: 9, column: 0 }

  assert.equal(value, expected)
})

suite('navigates to located element\'s new location when columns are reordered', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useEligibleInPlaneNavigateApi/abilityReactive')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))

  const value = await page.evaluate(async () => {
          window.testState.reorderColumns()
          await window.nextTick()
          return {
            row: window.testState.rows.location,
            column: window.testState.columns.location,
          }
        }),
        expected = { row: 0, column: 9 }

  assert.equal(value, expected)
})

suite('navigates to first when rows are reordered and element\'s new location is disabled', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useEligibleInPlaneNavigateApi/abilityReactive')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = [
    ...new Array(9).fill([...new Array(9).fill('enabled'), 'disabled']),
    new Array(10).fill('disabled'),
  ])

  const value = await page.evaluate(async () => {
          window.testState.reorderRows()
          await window.nextTick()
          return {
            row: window.testState.rows.location,
            column: window.testState.columns.location,
          }
        }),
        expected = { row: 0, column: 0 }

  assert.equal(value, expected)
})

suite('navigates to last eligible in row when column is removed', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useEligibleInPlaneNavigateApi/abilityReactive')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))

  const value = await page.evaluate(async () => {
          window.testState.columns.navigate(9)
          window.testState.removeColumn()
          await window.nextTick()
          return {
            row: window.testState.rows.location,
            column: window.testState.columns.location,
          }
        }),
        expected = { row:0, column: 8 }

  assert.equal(value, expected)
})

suite('navigates to last eligible in column when row is removed', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useEligibleInPlaneNavigateApi/abilityReactive')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))

  const value = await page.evaluate(async () => {
          window.testState.rows.navigate(9)
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

suite('navigates to last when row and column are removed', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useEligibleInPlaneNavigateApi/abilityReactive')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))

  const value = await page.evaluate(async () => {
          window.testState.rows.navigate(9)
          window.testState.columns.navigate(9)
          window.testState.removeRowAndColumn()
          await window.nextTick()
          return {
            row: window.testState.rows.location,
            column: window.testState.columns.location,
          }
        }),
        expected = { row: 8, column: 8 }

  assert.equal(value, expected)
})

suite.run()
