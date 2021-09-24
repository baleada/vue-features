import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../../fixtures/types'

const suite = withPuppeteer(
  createSuite('useLabel')
)

// Primary functionality is tested in the useIdentified tests

suite(`optionally assigns labelled element's unique ID to label's htmlFor`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useLabel/withOptions')
  await page.waitForSelector('span')
  
  const value = await page.evaluate(async () => {
          return {
            htmlFor: (window as unknown as WithGlobals).testState.label.root.element.value.htmlFor,
            matching: (window as unknown as WithGlobals).testState.labelled.value.id
          }
        })

  assert.is(value.htmlFor, value.matching)
})

suite.run()
