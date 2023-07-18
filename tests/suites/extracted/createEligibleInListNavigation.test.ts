import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('createEligibleInListNavigation')
)

// VALUE GETTER
suite('exact() works with value getter ability', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListNavigation/abilityGetter')
  await page.waitForSelector('ul')

  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigation.exact(9),
                location = window.testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligibleNavigation.exact(3),
                location = window.testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 3 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.navigateable.value.first())
})

suite('first() works with value getter ability', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          window.testState.navigateable.value.navigate(9)

          const ability = window.testState.eligibleNavigation.first(),
                location = window.testState.navigateable.value.location

          return { ability, location }
        }),
        expected = { ability: 'enabled', location: 2 }

  assert.equal(value, expected)

  await page.evaluate(() => window.testState.navigateable.value.first())
})

suite('last() works with value getter ability', async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigation.last(),
                location = window.testState.navigateable.value.location

          return { ability, location }
        }),
        expected = { ability: 'enabled', location: 7 }

  assert.equal(value, expected)

  await page.evaluate(() => window.testState.navigateable.value.first())
})

suite('next() works with value getter ability', async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigation.next(7),
                location = window.testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligibleNavigation.next(3),
                location = window.testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 4 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.navigateable.value.first())
})

suite('previous() works with value getter ability', async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigation.previous(2),
                location = window.testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await window.nextTick()

          const ability = window.testState.eligibleNavigation.previous(5),
                location = window.testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 4 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.navigateable.value.first())
})


// REACTIVE VALUE GETTER
suite('exact() works with reactive value getter ability', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListNavigation/abilityReactiveGetter')
  await page.waitForSelector('ul')

  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigation.exact(9),
                location = window.testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill('enabled')

          await window.nextTick()

          const ability = window.testState.eligibleNavigation.exact(3),
                location = window.testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 3 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.navigateable.value.first())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('disabled'))
})

suite('first() works with reactive value getter ability', async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          window.testState.navigateable.value.navigate(9)

          const ability = window.testState.eligibleNavigation.first(),
                location = window.testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 9 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill('enabled')

          await window.nextTick()

          const ability = window.testState.eligibleNavigation.first(),
                location = window.testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 0 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.navigateable.value.first())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('disabled'))
})

suite('last() works with reactive value getter ability', async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigation.last(),
                location = window.testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill('enabled')

          await window.nextTick()

          const ability = window.testState.eligibleNavigation.last(),
                location = window.testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 9 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.navigateable.value.first())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('disabled'))
})

suite('next() works with reactive value getter ability', async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigation.next(0),
                location = window.testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill('enabled')

          await window.nextTick()

          const ability = window.testState.eligibleNavigation.next(0),
                location = window.testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 1 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.navigateable.value.first())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('disabled'))
})

suite('previous() works with reactive value getter ability', async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = window.testState.eligibleNavigation.previous(2),
                location = window.testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          window.testState.abilities.value = new Array(10).fill('enabled')

          await window.nextTick()

          const ability = window.testState.eligibleNavigation.previous(2),
                location = window.testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 1 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => window.testState.navigateable.value.first())
  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('disabled'))
})


// REORDER AND REMOVE
suite('navigates to located element\'s new location when elements are reordered', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListNavigation/abilityReactiveGetter')
  await page.waitForSelector('ul')

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('enabled'))

  const value = await page.evaluate(async () => {
          window.testState.reorder()
          await window.nextTick()
          return window.testState.navigateable.value.location
        }),
        expected = 9

  assert.is(value, expected)
})

// TODO: test conditional rendering case
suite('navigates to last when elements are removed and location is beyond the new end', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListNavigation/abilityReactiveGetter')
  await page.waitForSelector('ul')

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('enabled'))
  
  const value = await page.evaluate(async () => {
          window.testState.navigateable.value.last()
          window.testState.remove()
          await window.nextTick()
          return window.testState.navigateable.value.location
        }),
        expected = 4

  assert.is(value, expected)
})

suite('navigates to first when elements are reordered and element at location is removed', async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/createEligibleInListNavigation/abilityReactiveGetter')
  await page.waitForSelector('ul')

  await page.evaluate(() => window.testState.abilities.value = new Array(10).fill('enabled'))

  const value = await page.evaluate(async () => {
          window.testState.removeAndReorder()
          await window.nextTick()
          return window.testState.navigateable.value.location
        }),
        expected = 0

  assert.is(value, expected)
})

suite.run()
