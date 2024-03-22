import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('useListbox')
)

suite('assigns aria roles', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useListbox/withoutOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return [
            window.testState.listbox.root.element.value.getAttribute('role'),
            window.testState.listbox.options.list.value.map(option => option.getAttribute('role')),
          ]
        }),
        expected = [
          'listbox',
          [
            'option',
            'option',
            'option',
            'option',
            'option',
            'option',
          ],
        ]

  assert.equal(value, expected)
})

suite.run()
