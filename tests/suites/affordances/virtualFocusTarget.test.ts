import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { toOptionsParam } from '../../toParam'

const suite = withPlaywright(
  createSuite('virtualFocusTarget')
)

suite('scrolls virtually focused element into view', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/virtualFocusTarget/withUrlOptions')
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
    const top = window.testState.element.value.getBoundingClientRect().top
    window.testState.virtuallyFocus()
    await window.nextTick()
    return window.testState.element.value.getBoundingClientRect().top < top
  })

  assert.ok(value)
})

suite('respects scrollIntoView option', async ({ playwright: { page } }) => {
  const options = {
    scrollIntoView: { block: 'start' },
  }
  await page.goto(`http://localhost:5173/virtualFocusTarget/withUrlOptions${toOptionsParam(options)}`)
  await page.waitForSelector('div', { state: 'attached' })

  const value = await page.evaluate(async () => {
    window.testState.virtuallyFocus()
    await window.nextTick()
    const top = window.testState.element.value.getBoundingClientRect().top

    window.testState.scrollable.value.scrollTop = 0
    window.testState.element.value.scrollIntoView({ block: 'end' })

    return window.testState.element.value.getBoundingClientRect().top > top
  })

  assert.ok(value)
})

suite.run()
