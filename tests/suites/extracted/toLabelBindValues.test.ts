import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('toLabelBindValues')
)

suite('binds labelling props to elements', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/toLabelBindValues/element')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(() => ({
          label: window.testState.api.element.value.getAttribute('aria-label'),
          labelledBy: window.testState.api.element.value.getAttribute('aria-labelledby'),
          description: window.testState.api.element.value.getAttribute('aria-description'),
          describedBy: window.testState.api.element.value.getAttribute('aria-describedby'),
          details: window.testState.api.element.value.getAttribute('aria-details'),
        })),
        expected = {
          label: 'label',
          labelledBy: 'labelledBy',
          description: 'description',
          describedBy: 'describedBy errorMessage',
          details: 'details',
        }

  assert.equal(value, expected)
})

suite('binds labelling props to lists', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/toLabelBindValues/list')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(() => window.testState.api.list.value.map(element => ({
          label: element.getAttribute('aria-label'),
          labelledBy: element.getAttribute('aria-labelledby'),
          description: element.getAttribute('aria-description'),
          describedBy: element.getAttribute('aria-describedby'),
          details: element.getAttribute('aria-details'),
        }))),
        expected = {
          label: 'label',
          labelledBy: 'labelledBy',
          description: 'description',
          describedBy: 'describedBy errorMessage',
          details: 'details',
        }

  for (const item of value) {
    assert.equal(item, expected)
  }
})

suite('binds labelling props to planes', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/toLabelBindValues/plane')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(() => window.testState.api.plane.value.map(
          row => row.map(element => ({
            label: element.getAttribute('aria-label'),
            labelledBy: element.getAttribute('aria-labelledby'),
            description: element.getAttribute('aria-description'),
            describedBy: element.getAttribute('aria-describedby'),
            details: element.getAttribute('aria-details'),
          }))
        )),
        expected = {
          label: 'label',
          labelledBy: 'labelledBy',
          description: 'description',
          describedBy: 'describedBy errorMessage',
          details: 'details',
        }

  for (const row of value) {
    for (const cell of row) {
      assert.equal(cell, expected)
    }
  }
})

suite.run()
