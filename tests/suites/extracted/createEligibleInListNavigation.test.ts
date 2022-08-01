import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('createEligibleNavigation')
)

// VALUE GETTER
suite(`exact() works with value getter ability`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListNavigation/abilityGetter')
  await page.waitForSelector('ul')

  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.exact(9),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.exact(3),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 3 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})

suite(`first() works with value getter ability`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.navigateable.value.navigate(9)

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.first(),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        expected = { ability: 'enabled', location: 2 }

  assert.equal(value, expected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})

suite(`last() works with value getter ability`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.last(),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        expected = { ability: 'enabled', location: 7 }

  assert.equal(value, expected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})

suite(`next() works with value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.next(7),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.next(3),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 4 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})

suite(`previous() works with value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.previous(2),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.previous(5),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 4 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})


// REACTIVE VALUE GETTER
suite(`exact() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListNavigation/abilityReactiveGetter')
  await page.waitForSelector('ul')

  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.exact(9),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled')

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.exact(3),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 3 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('disabled'))
})

suite(`first() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.navigateable.value.navigate(9)

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.first(),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 9 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled')

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.first(),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 0 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('disabled'))
})

suite(`last() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.last(),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled')

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.last(),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 9 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('disabled'))
})

suite(`next() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.next(0),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled')

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.next(0),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 1 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('disabled'))
})

suite(`previous() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.previous(2),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled')

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligibleNavigation.previous(2),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 1 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('disabled'))
})


// REORDER AND REMOVE
suite(`navigates to located element's new location when elements are reordered`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListNavigation/abilityReactiveGetter')
  await page.waitForSelector('ul')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled'))

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.reorder()
          await (window as unknown as WithGlobals).nextTick()
          return (window as unknown as WithGlobals).testState.navigateable.value.location
        }),
        expected = 9

  assert.is(value, expected)
})

// TODO: test conditional rendering case
suite(`navigates to last when elements are removed and location is beyond the new end`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListNavigation/abilityReactiveGetter')
  await page.waitForSelector('ul')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled'))
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.navigateable.value.last()
          ;(window as unknown as WithGlobals).testState.remove()
          await (window as unknown as WithGlobals).nextTick()
          return (window as unknown as WithGlobals).testState.navigateable.value.location
        }),
        expected = 4

  assert.is(value, expected)
})

suite(`navigates to first when elements are reordered and element at location is removed`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListNavigation/abilityReactiveGetter')
  await page.waitForSelector('ul')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled'))

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.removeAndReorder()
          await (window as unknown as WithGlobals).nextTick()
          return (window as unknown as WithGlobals).testState.navigateable.value.location
        }),
        expected = 0

  assert.is(value, expected)
})

suite.run()
