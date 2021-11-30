import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('createEligiblePicking')
)


// STATIC
suite(`exact() works with statically enabled elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/eligiblePicking/static')
  await page.waitForSelector('ul')

  const value = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.exact(3),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        expected = { ability: 'enabled', picks: [3] }

  assert.equal(value, expected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.pickable.value.omit())
})

suite(`next() works with statically enabled elements`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.next(3),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        expected = { ability: 'enabled', picks: [4] }

  assert.equal(value, expected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.pickable.value.omit())
})

suite(`previous() works with statically enabled elements`, async ({ puppeteer: { page } }) => {
  const value = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.previous(3),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        expected = { ability: 'enabled', picks: [2] }

  assert.equal(value, expected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.pickable.value.omit())
})


// REACTIVE
suite(`exact() works with reactively enabled elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/eligiblePicking/ref')
  await page.waitForSelector('ul')

  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.exact(3),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.ability.value = 'enabled'

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.exact(3),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        enabledExpected = { ability: 'enabled', picks: [3] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.ability.value = 'disabled')
  await page.evaluate(() => (window as unknown as WithGlobals).testState.pickable.value.omit())
})

suite(`next() works with reactively enabled elements`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.next(3),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.ability.value = 'enabled'

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.next(3),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        enabledExpected = { ability: 'enabled', picks: [4] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.ability.value = 'disabled')
  await page.evaluate(() => (window as unknown as WithGlobals).testState.pickable.value.omit())
})

suite(`previous() works with reactively enabled elements`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.previous(3),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.ability.value = 'enabled'

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.previous(3),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        enabledExpected = { ability: 'enabled', picks: [2] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.ability.value = 'disabled')
  await page.evaluate(() => (window as unknown as WithGlobals).testState.pickable.value.omit())
})


// GOTTEN
suite(`exact() works with gotten ability`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/eligiblePicking/get')
  await page.waitForSelector('ul')

  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.exact(9),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.exact(3),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        enabledExpected = { ability: 'enabled', picks: [3] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.pickable.value.omit())
})

suite(`next() works with gotten ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.next(7),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.next(3),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        enabledExpected = { ability: 'enabled', picks: [4] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.pickable.value.omit())
})

suite(`previous() works with gotten ability`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.previous(2),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.previous(5),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        enabledExpected = { ability: 'enabled', picks: [4] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.pickable.value.omit())
})


// GOTTEN FROM WATCH SOURCE
suite(`exact() works with ability gotten from watch source`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/eligiblePicking/getFromWatchSource')
  await page.waitForSelector('ul')

  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.exact(9),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled')

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.exact(3),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        enabledExpected = { ability: 'enabled', picks: [3] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.pickable.value.omit())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('disabled'))
})

suite(`next() works with ability gotten from watch source`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.next(0),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled')

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.next(0),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        enabledExpected = { ability: 'enabled', picks: [1] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.pickable.value.omit())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('disabled'))
})

suite(`previous() works with ability gotten from watch source`, async ({ puppeteer: { page } }) => {
  const disabledValue = await page.evaluate(async () => {
          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.previous(2),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        disabledExpected = { ability: 'none', picks: [] }

  assert.equal(disabledValue, disabledExpected)
  
  const enabledValue = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled')

          await (window as unknown as WithGlobals).nextTick()

          const ability = (window as unknown as WithGlobals).testState.eligiblePicking.previous(2),
                picks = [...(window as unknown as WithGlobals).testState.pickable.value.picks]

          return { ability, picks }
        }),
        enabledExpected = { ability: 'enabled', picks: [1] }

  assert.equal(enabledValue, enabledExpected)

  await page.evaluate(() => (window as unknown as WithGlobals).testState.pickable.value.omit())
  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('disabled'))
})

// REORDER AND REMOVE
suite(`picks picked element's new location when elements are reordered`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/eligiblePicking/getFromWatchSource')
  await page.waitForSelector('ul')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled'))

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.pickable.value.pick(0);
          (window as unknown as WithGlobals).testState.reorder()
          await (window as unknown as WithGlobals).nextTick()
          return [...(window as unknown as WithGlobals).testState.pickable.value.picks]
        }),
        expected = [9]

  assert.equal(value, expected)
})

suite(`omits when elements are removed and location is beyond the new end`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/eligiblePicking/getFromWatchSource')
  await page.waitForSelector('ul')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled'))
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.pickable.value.pick(9);  
          (window as unknown as WithGlobals).testState.remove()
          await (window as unknown as WithGlobals).nextTick()
          return [...(window as unknown as WithGlobals).testState.pickable.value.picks]
        }),
        expected = []

  assert.equal(value, expected)
})


// ABILITY CHANGE
suite(`omits when ability ref is changed to 'disabled'`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/eligiblePicking/ref')
  await page.waitForSelector('ul')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.ability.value = 'enabled')
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.pickable.value.pick([0, 1, 2]);  
          (window as unknown as WithGlobals).testState.ability.value = 'disabled'
          await (window as unknown as WithGlobals).nextTick()
          return [...(window as unknown as WithGlobals).testState.pickable.value.picks]
        }),
        expected = []

  assert.equal(value, expected)
})

suite(`omits disabled when ability watch source changes`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/eligiblePicking/getFromWatchSource')
  await page.waitForSelector('ul')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled'))
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.pickable.value.pick(new Array(10).fill(0).map((_, index) => index));  
          (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(0).map((_, index) => index % 2 === 0 ? 'enabled' : 'disabled')
          await (window as unknown as WithGlobals).nextTick()
          return [...(window as unknown as WithGlobals).testState.pickable.value.picks]
        }),
        expected = [0, 2, 4, 6, 8]

  assert.equal(value, expected)
})

suite.run()
