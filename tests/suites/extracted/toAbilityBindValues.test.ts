import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('toAbilityBindValues')
)

suite('binds disabled props to elements', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/toAbilityBindValues/element')
  await page.waitForSelector('button', { state: 'attached' })

  const value = await page.evaluate(() => ({
          disabled: window.testState.api.element.value.disabled,
          ariaDisabled: window.testState.api.element.value.getAttribute('aria-disabled'),
          tabindex: window.testState.api.element.value.getAttribute('tabindex'),
        })),
        expected = {
          disabled: true,
          ariaDisabled: 'true',
          tabindex: '-1',
        }

  assert.equal(value, expected)
})

suite('binds reactive disabled props to elements', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/toAbilityBindValues/elementReactive')
  await page.waitForSelector('button', { state: 'attached' })

  const value = await page.evaluate(() => ({
          disabled: window.testState.api.element.value.disabled,
          ariaDisabled: window.testState.api.element.value.getAttribute('aria-disabled'),
          tabindex: window.testState.api.element.value.getAttribute('tabindex'),
        })),
        expected = {
          disabled: true,
          ariaDisabled: 'true',
          tabindex: '-1',
        }

  assert.equal(value, expected)
})

suite('binds disabled props to lists', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/toAbilityBindValues/list')
  await page.waitForSelector('button', { state: 'attached' })

  const value = await page.evaluate(() => window.testState.api.list.value.map(element => ({
          disabled: element.disabled,
          ariaDisabled: element.getAttribute('aria-disabled'),
          tabindex: element.getAttribute('tabindex'),
        }))),
        expected = {
          disabled: true,
          ariaDisabled: 'true',
          tabindex: '-1',
        }

  for (const item of value) {
    assert.equal(item, expected)
  }
})

suite('binds reactive disabled props to lists', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/toAbilityBindValues/listReactive')
  await page.waitForSelector('button', { state: 'attached' })

  const value = await page.evaluate(() => window.testState.api.list.value.map(element => ({
          disabled: element.disabled,
          ariaDisabled: element.getAttribute('aria-disabled'),
          tabindex: element.getAttribute('tabindex'),
        }))),
        expected = {
          disabled: true,
          ariaDisabled: 'true',
          tabindex: '-1',
        }

  for (const item of value) {
    assert.equal(item, expected)
  }
})

suite('binds disabled props to planes', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/toAbilityBindValues/plane')
  await page.waitForSelector('button', { state: 'attached' })

  const value = await page.evaluate(() => window.testState.api.plane.value.map(
          row => row.map(element => ({
            disabled: element.disabled,
            ariaDisabled: element.getAttribute('aria-disabled'),
            tabindex: element.getAttribute('tabindex'),
          }))
        )),
        expected = {
          disabled: true,
          ariaDisabled: 'true',
          tabindex: '-1',
        }

  for (const row of value) {
    for (const cell of row) {
      assert.equal(cell, expected)
    }
  }
})

suite('binds reactive disabled props to planes', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/toAbilityBindValues/planeReactive')
  await page.waitForSelector('button', { state: 'attached' })

  const value = await page.evaluate(() => window.testState.api.plane.value.map(
          row => row.map(element => ({
            disabled: element.disabled,
            ariaDisabled: element.getAttribute('aria-disabled'),
            tabindex: element.getAttribute('tabindex'),
          }))
        )),
        expected = {
          disabled: true,
          ariaDisabled: 'true',
          tabindex: '-1',
        }

  for (const row of value) {
    for (const cell of row) {
      assert.equal(cell, expected)
    }
  }
})

suite.run()
