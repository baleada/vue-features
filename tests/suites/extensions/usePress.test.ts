import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { toOptionsParam } from '../../toParam'

const suite = withPlaywright(
  createSuite('usePress')
)

suite('sets status to pressed', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/withUrlOptions')
  await page.waitForSelector('button', { state: 'attached' })

  await page.focus('button')
  await page.keyboard.down('Enter')

  const value = await page.evaluate(async () => window.testState.pressable.status.value),
        expected = 'pressed'

  assert.is(value, expected)
})

suite('sets status to released', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/withUrlOptions')
  await page.waitForSelector('button', { state: 'attached' })

  await page.focus('button')
  await page.keyboard.down('Enter')
  await page.keyboard.up('Enter')

  const value = await page.evaluate(async () => window.testState.pressable.status.value),
        expected = 'released'

  assert.is(value, expected)
})

suite('sets press via keyboard', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/withUrlOptions')
  await page.waitForSelector('button', { state: 'attached' })

  await page.focus('button')
  await page.keyboard.down('Enter')

  const value = await page.evaluate(async () => window.testState.pressable.descriptor.value.kind),
        expected = 'keyboard'

  assert.is(value, expected)
})

suite('sets press via mouse', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/withUrlOptions')
  await page.waitForSelector('button', { state: 'attached' })

  const { top, left } = await page.evaluate(() => {
    return document.querySelector('button').getBoundingClientRect()
  })
  await page.mouse.move(left, top)
  await page.mouse.down()

  const value = await page.evaluate(async () => window.testState.pressable.descriptor.value.kind),
        expected = 'mouse'

  assert.is(value, expected)
})

suite('sets first press via keyboard', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/withUrlOptions')
  await page.waitForSelector('button', { state: 'attached' })

  await page.focus('button')
  await page.keyboard.down('Enter')
  await page.waitForTimeout(50)
  await page.keyboard.up('Enter')

  const value = await page.evaluate(async () => (
          window.testState.pressable.firstDescriptor.value.sequence.length === 1
          && window.testState.pressable.firstDescriptor.value.sequence[0] === window.testState.pressable.descriptor.value.sequence[0]
          && window.testState.pressable.firstDescriptor.value !== window.testState.pressable.descriptor.value
        )),
        expected = true

  assert.is(value, expected)
})

suite('sets first press via mouse', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/withUrlOptions')
  await page.waitForSelector('button', { state: 'attached' })

  const { top, left } = await page.evaluate(() => {
    return document.querySelector('button').getBoundingClientRect()
  })
  await page.mouse.move(left, top)
  await page.mouse.down()
  await page.waitForTimeout(50)
  await page.mouse.up()

  const value = await page.evaluate(async () => (
          window.testState.pressable.firstDescriptor.value.sequence.length === 1
          && window.testState.pressable.firstDescriptor.value.sequence[0] === window.testState.pressable.descriptor.value.sequence[0]
          && window.testState.pressable.firstDescriptor.value !== window.testState.pressable.descriptor.value
        )),
        expected = true

  assert.is(value, expected)
})

suite('sets release via keyboard', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/withUrlOptions')
  await page.waitForSelector('button', { state: 'attached' })

  await page.focus('button')
  await page.keyboard.down('Enter')
  await page.keyboard.up('Enter')

  const value = await page.evaluate(async () => window.testState.pressable.releaseDescriptor.value.kind),
        expected = 'keyboard'

  assert.is(value, expected)
})

suite('sets release via mouse', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePress/withUrlOptions')
  await page.waitForSelector('button', { state: 'attached' })

  const { top, left } = await page.evaluate(() => {
    return document.querySelector('button').getBoundingClientRect()
  })
  await page.mouse.move(left, top)
  await page.mouse.down()
  await page.mouse.up()

  const value = await page.evaluate(async () => window.testState.pressable.releaseDescriptor.value.kind),
        expected = 'mouse'

  assert.is(value, expected)
})

suite('doesn\'t set press via keyboard when keyboard is false', async ({ playwright: { page } }) => {
  const options = {
    press: { keyboard: false },
  }
  await page.goto(`http://localhost:5173/usePress/withUrlOptions${toOptionsParam(options)}`)
  await page.waitForSelector('button', { state: 'attached' })

  await page.focus('button')
  await page.keyboard.down('Enter')

  const value = await page.evaluate(async () => window.testState.pressable.descriptor.value),
        expected = undefined

  assert.is(value, expected)
})

suite('doesn\'t set press via mouse when mouse is false', async ({ playwright: { page } }) => {
  const options = {
    press: { mouse: false },
  }
  await page.goto(`http://localhost:5173/usePress/withUrlOptions${toOptionsParam(options)}`)
  await page.waitForSelector('button', { state: 'attached' })

  const { top, left } = await page.evaluate(() => {
    return document.querySelector('button').getBoundingClientRect()
  })
  await page.mouse.move(left, top)
  await page.mouse.down()

  const value = await page.evaluate(async () => window.testState.pressable.descriptor.value),
        expected = undefined

  assert.is(value, expected)
})

suite('doesn\'t set release via keyboard when keyboard is false', async ({ playwright: { page } }) => {
  const options = {
    release: { keyboard: false },
  }
  await page.goto(`http://localhost:5173/usePress/withUrlOptions${toOptionsParam(options)}`)
  await page.waitForSelector('button', { state: 'attached' })

  await page.focus('button')
  await page.keyboard.down('Enter')
  await page.keyboard.up('Enter')

  const value = await page.evaluate(async () => window.testState.pressable.releaseDescriptor.value),
        expected = undefined

  assert.is(value, expected)
})

suite('doesn\'t set release via mouse when mouse is false', async ({ playwright: { page } }) => {
  const options = {
    release: { mouse: false },
  }
  await page.goto(`http://localhost:5173/usePress/withUrlOptions${toOptionsParam(options)}`)
  await page.waitForSelector('button', { state: 'attached' })

  const { top, left } = await page.evaluate(() => {
    return document.querySelector('button').getBoundingClientRect()
  })
  await page.mouse.move(left, top)
  await page.mouse.down()
  await page.mouse.up()

  const value = await page.evaluate(async () => window.testState.pressable.releaseDescriptor.value),
        expected = undefined

  assert.is(value, expected)
})

suite.run()
