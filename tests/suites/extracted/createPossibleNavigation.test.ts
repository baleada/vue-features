import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('createEnabledNavigation')
)

// NEXT POSSIBLE
suite(`toNextPossible() returns next possible when loops is false and there is a next possible`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/possibleNavigation/toNextPossible')
  await page.waitForSelector('ul')

  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextPossible({
            index: 0,
            toIsPossible: index => index === 2,
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toNextPossible() returns next possible when loops is true and there is a next possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextPossible_loops({
            index: 3,
            toIsPossible: index => index === 2
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toNextPossible() returns 'none' when loops is false and there is no next possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextPossible({
            index: 0,
            toIsPossible: index => index === -1
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toNextPossible() returns 'none' when loops is true and there is no next possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextPossible_loops({
            index: 0,
            toIsPossible: index => index === -1
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toNextPossible() finds next possible starting from impossible index`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toNextPossible({
            index: -1,
            toIsPossible: index => index === 0
          })
        }),
        expected = 0

  assert.is(value, expected)
})


// PREVIOUS POSSIBLE
suite(`toPreviousPossible() returns previous possible when loops is false and there is a previous possible`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/possibleNavigation/toPreviousPossible')
  await page.waitForSelector('ul')

  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousPossible({
            index: 9,
            toIsPossible: index => index === 2,
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toPreviousPossible() returns previous possible when loops is true and there is a previous possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousPossible_loops({
            index: 1,
            toIsPossible: index => index === 2
          })
        }),
        expected = 2

  assert.is(value, expected)
})

suite(`toPreviousPossible() returns 'none' when loops is false and there is no previous possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousPossible({
            index: 9,
            toIsPossible: index => index === -1
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toPreviousPossible() returns 'none' when loops is true and there is no previous possible`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousPossible_loops({
            index: 9,
            toIsPossible: index => index === -1
          })
        }),
        expected = 'none'

  assert.is(value, expected)
})

suite(`toPreviousPossible() finds previous possible starting from impossible index`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(() => {
          return (window as unknown as WithGlobals).testState.toPreviousPossible({
            index: 10,
            toIsPossible: index => index === 9
          })
        }),
        expected = 9

  assert.is(value, expected)
})


// STATIC
suite(`exact() works with statically enabled elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/possibleNavigation/static')
  await page.waitForSelector('ul')

  const value = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.exact(3),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        expected = { ability: 'enabled', location: 3 }

  assert.equal(value, expected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})

suite(`first() works with statically enabled elements`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.first(),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        expected = { ability: 'enabled', location: 0 }

  assert.equal(value, expected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})

suite(`last() works with statically enabled elements`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.last(),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        expected = { ability: 'enabled', location: 9 }

  assert.equal(value, expected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})

suite(`next() works with statically enabled elements`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.next(3),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        expected = { ability: 'enabled', location: 4 }

  assert.equal(value, expected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})

suite(`previous() works with statically enabled elements`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.previous(3),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        expected = { ability: 'enabled', location: 2 }

  assert.equal(value, expected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})


// REACTIVE
suite(`exact() works with reactively enabled elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/possibleNavigation/ref')
  await page.waitForSelector('ul')

  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.exact(3),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.ability.value = 'enabled'

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.exact(3),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 3 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.ability.value = 'disabled')
  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})

suite(`first() works with reactively enabled elements`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.navigateable.value.navigate(9)

          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.first(),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 9 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.ability.value = 'enabled'

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.first(),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 0 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.ability.value = 'disabled')
  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})

suite(`last() works with reactively enabled elements`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.last(),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.ability.value = 'enabled'

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.last(),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 9 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.ability.value = 'disabled')
  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})

suite(`next() works with reactively enabled elements`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.next(3),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.ability.value = 'enabled'

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.next(3),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 4 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.ability.value = 'disabled')
  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})

suite(`previous() works with reactively enabled elements`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.previous(3),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.ability.value = 'enabled'

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.previous(3),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 2 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.ability.value = 'disabled')
  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})


// GOTTEN
suite(`exact() works with gotten ability`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/possibleNavigation/get')
  await page.waitForSelector('ul')

  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.exact(9),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.exact(3),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 3 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})

suite(`first() works with gotten ability`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.navigateable.value.navigate(9)

          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.first(),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        expected = { ability: 'enabled', location: 2 }

  assert.equal(value, expected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})

suite(`last() works with gotten ability`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.last(),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        expected = { ability: 'enabled', location: 7 }

  assert.equal(value, expected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})

suite(`next() works with gotten ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.next(7),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.next(3),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 4 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})

suite(`previous() works with gotten ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.previous(2),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.previous(5),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 4 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
})


// GOTTEN FROM WATCH SOURCE
suite(`exact() works with ability gotten from watch source`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/possibleNavigation/getFromWatchSource')
  await page.waitForSelector('ul')

  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.exact(9),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled')

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.exact(3),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 3 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('disabled'))
})

suite(`first() works with ability gotten from watch source`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.navigateable.value.navigate(9)

          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.first(),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 9 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled')

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.first(),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 0 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('disabled'))
})

suite(`last() works with ability gotten from watch source`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.last(),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled')

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.last(),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 9 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('disabled'))
})

suite(`next() works with ability gotten from watch source`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.next(0),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled')

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.next(0),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 1 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('disabled'))
})

suite(`previous() works with ability gotten from watch source`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.previous(2),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        disabledExpected = { ability: 'none', location: 0 }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled')

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.possibleNavigation.previous(2),
                location = (window as unknown as WithGlobals).testState.navigateable.value.location

          return { ability, location }
        }),
        enabledExpected = { ability: 'enabled', location: 1 }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.navigateable.value.first())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('disabled'))
})

suite.run()
