import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('createEligibeInPlanePicking')
)

// VALUE GETTER
suite(`exact() works with value getter ability`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/createEligibleInPlanePicking/get')
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

suite(`next() works with value getter ability`, async ({ puppeteer: { page } }) => {
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

suite(`previous() works with value getter ability`, async ({ puppeteer: { page } }) => {
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


// REACTIVE VALUE GETTER
suite(`exact() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/createEligibleInPlanePicking/getFromWatchSource')
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

suite(`next() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
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

suite(`previous() works with reactive value getter ability`, async ({ puppeteer: { page } }) => {
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
  await page.goto('http://localhost:3000/createEligibleInPlanePicking/getFromWatchSource')
  await page.waitForSelector('ul')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled'))

  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.pickable.value.pick(0)
          ;(window as unknown as WithGlobals).testState.reorder()
          await (window as unknown as WithGlobals).nextTick()
          return [...(window as unknown as WithGlobals).testState.pickable.value.picks]
        }),
        expected = [9]

  assert.equal(value, expected)
})

suite(`omits when elements are removed and location is beyond the new end`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/createEligibleInPlanePicking/getFromWatchSource')
  await page.waitForSelector('ul')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled'))
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.pickable.value.pick(9)  
          ;(window as unknown as WithGlobals).testState.remove()
          await (window as unknown as WithGlobals).nextTick()
          return [...(window as unknown as WithGlobals).testState.pickable.value.picks]
        }),
        expected = []

  assert.equal(value, expected)
})


// ABILITY CHANGE
suite(`omits disabled when reactive value getter watch source changes`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/createEligibleInPlanePicking/getFromWatchSource')
  await page.waitForSelector('ul')

  await page.evaluate(() => (window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill('enabled'))
  
  const value = await page.evaluate(async () => {
          (window as unknown as WithGlobals).testState.pickable.value.pick(new Array(10).fill(0).map((_, index) => index))  
          ;(window as unknown as WithGlobals).testState.abilities.value = new Array(10).fill(0).map((_, index) => index % 2 === 0 ? 'enabled' : 'disabled')
          await (window as unknown as WithGlobals).nextTick()
          return [...(window as unknown as WithGlobals).testState.pickable.value.picks]
        }),
        expected = [0, 2, 4, 6, 8]

  assert.equal(value, expected)
})

suite.run()
