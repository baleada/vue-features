import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { toOptionsParam } from '../../toParam'

const suite = withPlaywright(
  createSuite('useGrid')
)

suite('assigns aria roles', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useGrid/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
    return [
      window.testState.grid.root.element.value.getAttribute('role'),
      window.testState.grid.rowgroups.list.value.map(rowgroup => rowgroup.getAttribute('role')),
      window.testState.grid.rows.list.value.map(row => row.getAttribute('role')),
      window.testState.grid.cells.plane.value.flatMap(row => row.map(cell => cell.getAttribute('role'))),
    ]
  })

  assert.is(value[0], 'grid')
  assert.ok(value[1].every(role => role === 'rowgroup'))
  assert.ok(value[2].every(role => role === 'row'))
  assert.ok(value[3].slice(3).every(role => role === 'gridcell'))
})

suite('respects needsAriaOwns option', async ({ playwright: { page } }) => {
  const options = {
    needsAriaOwns: true,
  }
  await page.goto(`http://localhost:5173/useGrid/withUrlOptions${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
    return [
      [
        window.testState.grid.rows.list.value[0].getAttribute('aria-owns').split(' ').length,
        window.testState.grid.cells.plane.value[0].length,
      ],
    ]
  })

  assert.ok(value.every(([v, expected]) => v > 0 && v === expected))
})

suite.run()
