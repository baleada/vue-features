import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { toOptionsParam } from '../../toOptionsParam'

const suite = withPlaywright(
  createSuite('useDialog')
)

suite('correctly assigns aria roles', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useDialog')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.dialog.root.element.value.getAttribute('role')
        }),
        expected = 'dialog'
        
  assert.is(value, expected)
})

suite('respects alerts option', async ({ playwright: { page } }) => {
  const options = {
    alerts: true,
  }  
  await page.goto(`http://localhost:5173/useDialog${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.dialog.root.element.value.getAttribute('role')
        }),
        expected = 'alertdialog'
        
  assert.is(value, expected)
})

suite.run()
