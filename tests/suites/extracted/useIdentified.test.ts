import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useIdentified')
)

suite(`assigns unique ID to identified element`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useIdentified/calledRef')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          return (window as unknown as WithGlobals).testState.identified.element.value.id.length
        }),
        expected = 8

  assert.is(value, expected)
})

suite(`assigns matching unique ID to the property that identifies the element`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useIdentified/calledRef')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          return {
            id: (window as unknown as WithGlobals).testState.identified.element.value.id,
            matching: (window as unknown as WithGlobals).testState.identifying.value.getAttribute(
              (window as unknown as WithGlobals).testState.attribute
            )
          }
        })

  assert.is(value.id, value.matching)
})

suite(`prevents effect when identified ref is not called`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useIdentified/notCalledRef')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          return (window as unknown as WithGlobals).testState.identifying.value.hasAttribute(
            (window as unknown as WithGlobals).testState.attribute
          )
        }),
        expected = false

  assert.is(value, expected)
})

suite.run()
