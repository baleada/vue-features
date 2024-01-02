import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('createEligibleInListNavigateApi')
)

// VALUE GETTER
suite('exact() works with value getter ability', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListNavigateApi/abilityGetter')
  await page.waitForSelector('ul', { state: 'attached' })

  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.exact(9),
                location = window.testState.navigateable.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.exact(3),
                location = window.testState.navigateable.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 3 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.navigateable.first())
})

suite('first() works with value getter ability', async ({ playwright: { page } }) => {
  const value = await page.evaluate(async () => {
          window.testState.navigateable.navigate(9)

          const ability = window.testState.eligibleNavigateApi.first(),
                location = window.testState.navigateable.location

          return { ability, location }
        }),
        expected = { ability: 'enabled', location: 2 }

  assert.equal(value, expected)

  await page.evaluate(() => window.testState.navigateable.first())
})

suite('last() works with value getter ability', async ({ playwright: { page } }) => {
  const value = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.last(),
                location = window.testState.navigateable.location

          return { ability, location }
        }),
        expected = { ability: 'enabled', location: 7 }

  assert.equal(value, expected)

  await page.evaluate(() => window.testState.navigateable.first())
})

suite('next() works with value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.next(7),
                location = window.testState.navigateable.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.next(3),
                location = window.testState.navigateable.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 4 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.navigateable.first())
})

suite('previous() works with value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.previous(2),
                location = window.testState.navigateable.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.previous(5),
                location = window.testState.navigateable.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 4 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.navigateable.first())
})


// REACTIVE VALUE GETTER
suite('exact() works with reactive value getter ability', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListNavigateApi/abilityReactiveGetter')
  await page.waitForSelector('ul', { state: 'attached' })

  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.exact(9),
                location = window.testState.navigateable.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill('enabled')

          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.exact(3),
                location = window.testState.navigateable.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 3 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.navigateable.first())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('disabled'))
})

suite('first() works with reactive value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          window.testState.navigateable.navigate(9)

          const ability = window.testState.eligibleNavigateApi.first(),
                location = window.testState.navigateable.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 9 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill('enabled')

          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.first(),
                location = window.testState.navigateable.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 0 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.navigateable.first())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('disabled'))
})

suite('last() works with reactive value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.last(),
                location = window.testState.navigateable.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill('enabled')

          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.last(),
                location = window.testState.navigateable.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 9 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.navigateable.first())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('disabled'))
})

suite('next() works with reactive value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.next(0),
                location = window.testState.navigateable.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill('enabled')

          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.next(0),
                location = window.testState.navigateable.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 1 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.navigateable.first())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('disabled'))
})

suite('previous() works with reactive value getter ability', async ({ playwright: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigateApi.previous(2),
                location = window.testState.navigateable.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill('enabled')

          await window.nextTick()

          const ability = window.testState.eligibleNavigateApi.previous(2),
                location = window.testState.navigateable.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 1 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.navigateable.first())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('disabled'))
})


// REORDER AND REMOVE
suite('navigates to located element\'s new location when elements are reordered', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListNavigateApi/abilityReactiveGetter')
  await page.waitForSelector('ul', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('enabled'))

  const value = await page.evaluate(async () => {
          window.testState.reorder()
          await window.nextTick()
          return window.testState.navigateable.location
        }),
        expected = 9

  assert.is(value, expected)
})

// TODO: test conditional rendering case
suite('navigates to last when elements are removed and location is beyond the new end', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListNavigateApi/abilityReactiveGetter')
  await page.waitForSelector('ul', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('enabled'))
  
  const value = await page.evaluate(async () => {
          window.testState.navigateable.last()
          window.testState.remove()
          await window.nextTick()
          return window.testState.navigateable.location
        }),
        expected = 4

  assert.is(value, expected)
})

suite('navigates to first when elements are reordered and element at location is removed', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListNavigateApi/abilityReactiveGetter')
  await page.waitForSelector('ul', { state: 'attached' })

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('enabled'))

  const value = await page.evaluate(async () => {
          window.testState.removeAndReorder()
          await window.nextTick()
          return window.testState.navigateable.location
        }),
        expected = 0

  assert.is(value, expected)
})

suite.run()
