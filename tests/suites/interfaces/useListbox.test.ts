import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useListbox')
)

suite('assigns aria roles', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useListbox/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return [
            window.testState.listbox.root.element.value.getAttribute('role'),
            window.testState.listbox.options.list.value.map(option => option.getAttribute('role')),
          ]
        })

  assert.ok(
    value[0] === 'listbox'
    && value[1].every(role => role === 'option')
  )
})

suite.run()
