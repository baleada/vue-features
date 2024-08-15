import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useEligibleInPlanePickApi')
)

// STATIC ABILITY
suite('exact() works with static ability', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useEligibleInPlanePickApi/abilityStatic')
  await page.waitForSelector('div', { state: 'attached' })

  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePickApi.exact({ row: 0, column: 9 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligiblePickApi.exact({ row: 0, column: 3 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [0], columns: [3] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.omit())
  await page.evaluate(() => window.testState.columns.omit())
})

suite('nextInRow() works with static ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePickApi.nextInRow({ row: 0, column: 7 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligiblePickApi.nextInRow({ row: 0, column: 3 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [0], columns: [4] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.omit())
  await page.evaluate(() => window.testState.columns.omit())
})

suite('nextInColumn() works with static ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePickApi.nextInColumn({ row: 0, column: 9 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligiblePickApi.nextInColumn({ row: 0, column: 3 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [1], columns: [3] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.omit())
  await page.evaluate(() => window.testState.columns.omit())
})

suite('previousInRow() works with static ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePickApi.previousInRow({ row: 0, column: 2 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligiblePickApi.previousInRow({ row: 0, column: 5 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [0], columns: [4] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.omit())
  await page.evaluate(() => window.testState.columns.omit())
})

suite('previousInColumn() works with static ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePickApi.previousInColumn({ row: 1, column: 9 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligiblePickApi.previousInColumn({ row: 1, column: 2 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [0], columns: [2] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.omit())
  await page.evaluate(() => window.testState.columns.omit())
})


// REACTIVE ABILITY
suite('exact() works with reactive ability', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useEligibleInPlanePickApi/abilityReactive')
  await page.waitForSelector('div', { state: 'attached' })

  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePickApi.exact({ row: 9, column: 0 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await window.nextTick()

          const ability = window.testState.eligiblePickApi.exact({ row: 0, column: 0 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [0], columns: [0] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.omit())
  await page.evaluate(() => window.testState.columns.omit())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite('nextInRow() works with reactive ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePickApi.nextInRow({ row: 0, column: 0 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await window.nextTick()

          const ability = window.testState.eligiblePickApi.nextInRow({ row: 0, column: 0 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [0], columns: [1] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.omit())
  await page.evaluate(() => window.testState.columns.omit())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite('nextInColumn() works with reactive ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePickApi.nextInColumn({ row: 0, column: 0 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await window.nextTick()

          const ability = window.testState.eligiblePickApi.nextInColumn({ row: 0, column: 0 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [1], columns: [0] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.omit())
  await page.evaluate(() => window.testState.columns.omit())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite('previousInRow() works with reactive ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePickApi.previousInRow({ row: 0, column: 1 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await window.nextTick()

          const ability = window.testState.eligiblePickApi.previousInRow({ row: 0, column: 1 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [0], columns: [0] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.omit())
  await page.evaluate(() => window.testState.columns.omit())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

suite('previousInRow() works with reactive ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePickApi.previousInColumn({ row: 1, column: 0 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        disabledExpected = { ability: 'none', rows: [], columns: [] }

  assert.equal(disabledValue, disabledExpected)

  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled'))

          await window.nextTick()

          const ability = window.testState.eligiblePickApi.previousInColumn({ row: 1, column: 0 }),
                rows = [...window.testState.rows.picks],
                columns = [...window.testState.columns.picks]

          return { ability, rows, columns }
        }),
        enabledExpected = { ability: 'enabled', rows: [0], columns: [0] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.rows.omit())
  await page.evaluate(() => window.testState.columns.omit())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('disabled')))
})

// REORDER AND REMOVE
suite('picks picked element\'s new location when rows are reordered', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useEligibleInPlanePickApi/abilityReactive')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))

  const value = await page.evaluate(async () => {
          window.testState.rows.pick([0, 0], { allowsDuplicates: true })
          window.testState.columns.pick([0, 1])
          window.testState.reorderRows()
          await window.nextTick()
          return [
            [...window.testState.rows.picks],
            [...window.testState.columns.picks],
          ]
        }),
        expected = [[9, 9], [0, 1]]

  assert.equal(value, expected)
})

suite('picks picked element\'s new location when columns are reordered', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useEligibleInPlanePickApi/abilityReactive')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))

  const value = await page.evaluate(async () => {
          window.testState.rows.pick([0, 1])
          window.testState.columns.pick([0, 0], { allowsDuplicates: true })
          window.testState.reorderColumns()
          await window.nextTick()
          return [
            [...window.testState.rows.picks],
            [...window.testState.columns.picks],
          ]
        }),
        expected = [[0, 1], [9, 9]]

  assert.equal(value, expected)
})

suite('omits when row is are removed and location is beyond the new end', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useEligibleInPlanePickApi/abilityReactive')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))

  const value = await page.evaluate(async () => {
          window.testState.rows.pick([0, 9])
          window.testState.columns.pick([0, 9])
          window.testState.removeRow()
          await window.nextTick()
          return [
            [...window.testState.rows.picks],
            [...window.testState.columns.picks],
          ]
        }),
        expected = [[0], [0]]

  assert.equal(value, expected)
})

suite('omits when column is removed and location is beyond the new end', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useEligibleInPlanePickApi/abilityReactive')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))

  const value = await page.evaluate(async () => {
          window.testState.rows.pick([0, 9])
          window.testState.columns.pick([0, 9])
          window.testState.removeColumn()
          await window.nextTick()
          return [
            [...window.testState.rows.picks],
            [...window.testState.columns.picks],
          ]
        }),
        expected = [[0], [0]]

  assert.equal(value, expected)
})


// ABILITY CHANGE
suite('omits disabled when reactive ability changes', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useEligibleInPlanePickApi/abilityReactive')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill(new Array(10).fill('enabled')))

  const value = await page.evaluate(async () => {
          window.testState.rows.pick([0, 1])
          window.testState.columns.pick([0, 1])
          window.testState.abilities.value = [
            ['disabled', new Array(9).fill('enabled')],
            ...new Array(9).fill('enabled'),
          ]
          await window.nextTick()
          return [
            [...window.testState.rows.picks],
            [...window.testState.columns.picks],
          ]
        }),
        expected = [[1], [1]]

  assert.equal(value, expected)
})

// KIND AND/OR GROUP CHANGE
suite('omits all but last radio picked when reactive kind changes', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useEligibleInPlanePickApi/kindAndGroupReactive')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => {
    window.testState.kinds.value = [
      new Array(10).fill('radio'),
      new Array(10).fill('checkbox'),
      ...new Array(8).fill(new Array(10).fill('item')),
    ]
    window.testState.groups.value = [
      new Array(10).fill('a'),
      new Array(10).fill('a'),
      ...new Array(8).fill(new Array(10).fill('')),
    ]
})

  const value = await page.evaluate(async () => {
          window.testState.rows.pick([0, 1])
          window.testState.columns.pick([0, 1])
          window.testState.kinds.value = [
            new Array(10).fill('radio'),
            new Array(10).fill('radio'),
            ...new Array(8).fill(new Array(10).fill('item')),
          ]
          await window.nextTick()
          return [
            [...window.testState.rows.picks],
            [...window.testState.columns.picks],
          ]
        }),
        expected = [[1], [1]]

  assert.equal(value, expected)
})

suite('omits all but last radio picked when reactive group changes', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useEligibleInPlanePickApi/kindAndGroupReactive')
  await page.waitForSelector('div', { state: 'attached' })

  await page.evaluate(() => {
    window.testState.kinds.value = [
      new Array(10).fill('radio'),
      new Array(10).fill('radio'),
      ...new Array(8).fill(new Array(10).fill('item')),
    ]
    window.testState.groups.value = [
      new Array(10).fill('a'),
      new Array(10).fill('b'),
      ...new Array(8).fill(new Array(10).fill('')),
    ]
})

  const value = await page.evaluate(async () => {
          window.testState.rows.pick([0, 1])
          window.testState.columns.pick([0, 1])
          window.testState.groups.value = [
            new Array(10).fill('a'),
            new Array(10).fill('a'),
            ...new Array(8).fill(new Array(10).fill('')),
          ]
          await window.nextTick()
          return [
            [...window.testState.rows.picks],
            [...window.testState.columns.picks],
          ]
        }),
        expected = [[1], [1]]

  assert.equal(value, expected)
})

suite.run()
