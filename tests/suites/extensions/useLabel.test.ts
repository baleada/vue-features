import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useLabel')
)

// Primary functionality is tested in the useIdentified tests

suite(`optionally assigns labelled element's unique ID to label's htmlFor`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:5173/useLabel/withOptions')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          return {
            htmlFor: window.testState.label.root.element.value.htmlFor,
            matching: window.testState.labelled.value.id
          }
        })

  assert.is(value.htmlFor, value.matching)
})

suite.run()
