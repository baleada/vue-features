import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('createEligibleInListPickApi')
)

// VALUE GETTER
suite('exact() works with value getter ability', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListPickApi/abilityGetter')
  await page.waitForSelector('ul', { state: 'attached' })

  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePickApi.exact(9),
                picks = [...window.testState.pickable.picks]

          return { ability, picks }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligiblePickApi.exact(3),
                picks = [...window.testState.pickable.picks]

          return { ability, picks }
        }),
        enabledExpected = { ability: 'enabled', picks: [3] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.pickable.omit())
})

suite('next() works with value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePickApi.next(7),
                picks = [...window.testState.pickable.picks]

          return { ability, picks }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligiblePickApi.next(3),
                picks = [...window.testState.pickable.picks]

          return { ability, picks }
        }),
        enabledExpected = { ability: 'enabled', picks: [4] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.pickable.omit())
})

suite('previous() works with value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePickApi.previous(2),
                picks = [...window.testState.pickable.picks]

          return { ability, picks }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligiblePickApi.previous(5),
                picks = [...window.testState.pickable.picks]

          return { ability, picks }
        }),
        enabledExpected = { ability: 'enabled', picks: [4] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.pickable.omit())
})


// REACTIVE VALUE GETTER
suite('exact() works with reactive value getter ability', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListPickApi/abilityReactiveGetter')
  await page.waitForSelector('ul', { state: 'attached' })

  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePickApi.exact(9),
                picks = [...window.testState.pickable.picks]

          return { ability, picks }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill('enabled')

          await window.nextTick()

          const ability = window.testState.eligiblePickApi.exact(3),
                picks = [...window.testState.pickable.picks]

          return { ability, picks }
        }),
        enabledExpected = { ability: 'enabled', picks: [3] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.pickable.omit())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('disabled'))
})

suite('next() works with reactive value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePickApi.next(0),
                picks = [...window.testState.pickable.picks]

          return { ability, picks }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill('enabled')

          await window.nextTick()

          const ability = window.testState.eligiblePickApi.next(0),
                picks = [...window.testState.pickable.picks]

          return { ability, picks }
        }),
        enabledExpected = { ability: 'enabled', picks: [1] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.pickable.omit())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('disabled'))
})

suite('previous() works with reactive value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligiblePickApi.previous(2),
                picks = [...window.testState.pickable.picks]

          return { ability, picks }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill('enabled')

          await window.nextTick()

          const ability = window.testState.eligiblePickApi.previous(2),
                picks = [...window.testState.pickable.picks]

          return { ability, picks }
        }),
        enabledExpected = { ability: 'enabled', picks: [1] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.pickable.omit())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('disabled'))
})

// REORDER AND REMOVE
suite('picks picked element\'s new location when elements are reordered', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListPickApi/abilityReactiveGetter')
  await page.waitForSelector('ul', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('enabled'))

  const value = await page.evaluate(async () => {
          window.testState.pickable.pick(0)
          window.testState.reorder()
          await window.nextTick()
          return [...window.testState.pickable.picks]
        }),
        expected = [9]

  assert.equal(value, expected)
})

// TODO: test conditional rendering case
suite('omits when elements are removed and location is beyond the new end', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListPickApi/abilityReactiveGetter')
  await page.waitForSelector('ul', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('enabled'))
  
  const value = await page.evaluate(async () => {
          window.testState.pickable.pick(9)  
          window.testState.remove()
          await window.nextTick()
          return [...window.testState.pickable.picks]
        }),
        expected = []

  assert.equal(value, expected)
})


// ABILITY CHANGE
suite('omits disabled when reactive value getter watch source changes', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListPickApi/abilityReactiveGetter')
  await page.waitForSelector('ul', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('enabled'))
  
  const value = await page.evaluate(async () => {
          window.testState.pickable.pick(new Array(10).fill(0).map((_, index) => index))  
          window.testState.abilities.value = new Array(10).fill(0).map((_, index) => index % 2 === 0 ? 'enabled' : 'disabled')
          await window.nextTick()
          return [...window.testState.pickable.picks]
        }),
        expected = [0, 2, 4, 6, 8]

  assert.equal(value, expected)
})

suite.run()