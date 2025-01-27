import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'

const suite = withPlaywright(
  createSuite('delegatePress')
)

suite('delegates press', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/mountingDelegate')
  await page.waitForSelector('button', { state: 'attached' })

  await page.evaluate(() => window.testState.child.element.value.focus())

  await page.keyboard.down('Enter')

  const value = await page.evaluate(async () => window.testState.child.count.value),
        expected = 1

  await page.keyboard.up('Enter')

  assert.is(value, expected)
})

suite('delegates press when conditionally rendering component with its own mount hook', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/mountingDelegate')
  await page.waitForSelector('button', { state: 'attached' })

  await page.evaluate(() => window.testState.child.element.value.focus())

  await page.keyboard.down('Enter')
  await page.keyboard.up('Enter')

  await page.evaluate(() => window.testState.grandchild.element.value.focus())
  await page.keyboard.down('Enter')

  const value = await page.evaluate(async () => window.testState.grandchild.count.value),
        expected = 1

  await page.keyboard.up('Enter')

  assert.is(value, expected)
})

suite('delegates press when conditionally rendering element', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/conditionalDelegate')
  await page.waitForSelector('button', { state: 'attached' })

  await page.evaluate(() => window.testState.one.element.value.focus())

  await page.keyboard.down('Enter')
  await page.keyboard.up('Enter')

  await page.evaluate(() => window.testState.two.element.value.focus())
  await page.keyboard.down('Enter')

  const value = await page.evaluate(async () => window.testState.two.count.value),
        expected = 1

  await page.keyboard.up('Enter')

  assert.is(value, expected)
})

suite('delegates press for nested elements and their ancestors, preferring elements at the topmost painted layar', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/delegate-nested')
  await page.waitForSelector('div', { state: 'attached' })

  const { top, left } = await page.evaluate(() => window.testState.top.api1.element.value.getBoundingClientRect())

  await page.mouse.move(left, top)
  await page.mouse.down()
  await page.mouse.up()

  const value = await page.evaluate(async () => [
          window.testState.top.count1.value,
          window.testState.top.count2.value,
          window.testState.bottom.count1.value,
          window.testState.bottom.count2.value,
        ]),
        expected = [1, 1, 0, 0]

  assert.equal(value, expected)
})

suite('denies element when press starts inside the element but not every relevant event in sequence targets the element, and stops delegating the current press to that element', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/delegate-exiting')
  await page.waitForSelector('div', { state: 'attached' })

  const { top, left } = await page.evaluate(() => window.testState.exiting.api1.element.value.getBoundingClientRect())

  await page.mouse.move(left, top)
  await page.mouse.down()

  {
    const status = await page.evaluate(async () => window.testState.exiting.press1.status.value),
          expected = 'pressed'

    assert.is(status, expected)
  }

  await page.mouse.move(left + 200, top + 200)

  {
    const status = await page.evaluate(async () => window.testState.exiting.press1.status.value),
          expected = 'released'

    assert.is(status, expected)
  }

  await page.mouse.move(left, top)
  await page.mouse.down()

  {
    const status = await page.evaluate(async () => window.testState.exiting.press1.status.value),
          expected = 'released'

    assert.is(status, expected)
  }

  await page.mouse.up()

  {
    const status = await page.evaluate(async () => window.testState.exiting.press1.status.value),
          expected = 'released'

    assert.is(status, expected)
  }

  await page.mouse.move(left, top)
  await page.mouse.down()

  {
    const status = await page.evaluate(async () => window.testState.exiting.press1.status.value),
          expected = 'pressed'

    assert.is(status, expected)
  }

  await page.mouse.up()
})

suite('denies element when press starts outside the element', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/delegate-exiting')
  await page.waitForSelector('div', { state: 'attached' })

  const { top, left } = await page.evaluate(() => window.testState.exiting.api1.element.value.getBoundingClientRect())
  const { top: top2, left: left2 } = await page.evaluate(() => window.testState.exiting.api2.element.value.getBoundingClientRect())

  await page.mouse.move(left, top)
  await page.mouse.down()

  {
    const status = await page.evaluate(async () => window.testState.exiting.press2.status.value),
          expected = 'released'

    assert.is(status, expected)
  }

  await page.mouse.move(left2, top2)

  {
    const status = await page.evaluate(async () => window.testState.exiting.press2.status.value),
          expected = 'released'

    assert.is(status, expected)
  }

  await page.mouse.up()
})

suite('does not delegate press to underlay when unpressable overlay is not descendant', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/delegate-unpressable-overlay')
  await page.waitForSelector('div', { state: 'attached' })

  const { top, left } = await page.evaluate(() => window.testState.overlay.element.value.getBoundingClientRect())

  await page.mouse.move(left, top)
  await page.mouse.down()

  {
    const status = await page.evaluate(async () => window.testState.underlayPress.status.value),
          expected = 'released'

    await page.mouse.up()

    assert.is(status, expected)
  }


  {
    const { top, left } = await page.evaluate(() => window.testState.underlay.element.value.getBoundingClientRect())

    await page.mouse.move(left, top)
    await page.mouse.down()

    const status = await page.evaluate(async () => window.testState.underlayPress.status.value),
          expected = 'pressed'

    await page.mouse.up()

    assert.is(status, expected)
  }
})

suite('does not delegate press to element that moves underneath press after pressable element is removed', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/delegate-removing')
  await page.waitForSelector('div', { state: 'attached' })

  const { top, left } = await page.evaluate(() => window.testState.api1.element.value.getBoundingClientRect())

  await page.mouse.move(left, top)
  await page.mouse.down()

  const value = await page.evaluate(async () => ({ status: window.testState.press2.status.value, element1IsRemoved: !document.body.contains(window.testState.api1.element.value) })),
        expected = { status: 'released', element1IsRemoved: true }

  await page.mouse.up()

  assert.equal(value, expected)
})

suite('delegates onOut to element that is covered up by element without press after press starts', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/delegate-popup')
  await page.waitForSelector('div', { state: 'attached' })

  const { top, left } = await page.evaluate(() => window.testState.api1.element.value.getBoundingClientRect())

  await page.mouse.move(left, top)
  await page.mouse.down()

  // Playwright doesn't fire `pointerout` when the popup appears on top of the pressed element,
  // but moving the mouse 1px is enough to test delegation logic.
  await page.mouse.move(left + 1, top)

  const value = await page.evaluate(async () => window.testState.count1.value > 0 && window.testState.press1.status.value),
        expected = 'released'

  await page.mouse.up()

  assert.is(value, expected)
})

suite('delegates onUp to element that is covered up by element without press after press starts', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/delegate-popup')
  await page.waitForSelector('div', { state: 'attached' })

  const { top, left } = await page.evaluate(() => window.testState.api1.element.value.getBoundingClientRect())

  await page.mouse.move(left, top)
  await page.mouse.down()
  await page.mouse.up()

  const value = await page.evaluate(async () => window.testState.count1.value > 0 && window.testState.press1.status.value),
        expected = 'released'

  assert.is(value, expected)
})

suite('delegates onOut to element that is covered up by element with press after press starts', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/delegate-popup-with-press')
  await page.waitForSelector('div', { state: 'attached' })

  const { top, left } = await page.evaluate(() => window.testState.api1.element.value.getBoundingClientRect())

  await page.mouse.move(left, top)
  await page.mouse.down()

  // Playwright doesn't fire `pointerout` when the popup appears on top of the pressed element,
  // but moving the mouse 1px is enough to test delegation logic.
  await page.mouse.move(left + 1, top)

  const value = await page.evaluate(async () => window.testState.count1.value > 0 && window.testState.press1.status.value),
        expected = 'released'

  await page.mouse.up()

  assert.is(value, expected)
})

suite('delegates onUp to element that is covered up by element with press after press starts', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/delegate-popup-with-press')
  await page.waitForSelector('div', { state: 'attached' })

  const { top, left } = await page.evaluate(() => window.testState.api1.element.value.getBoundingClientRect())

  await page.mouse.move(left, top)
  await page.mouse.down()
  await page.mouse.up()

  const value = await page.evaluate(async () => window.testState.count1.value > 0 && window.testState.press1.status.value),
        expected = 'released'

  assert.is(value, expected)
})

suite.run()
