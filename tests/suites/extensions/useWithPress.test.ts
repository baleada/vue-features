import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { toOptionsParam } from '../../toOptionsParam'

const suite = withPlaywright(
  createSuite('useWithPress')
)

suite('sets status to pressed', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useWithPress/withUrlOptions')
  await page.waitForSelector('button', { state: 'attached' })

  await page.focus('button')
  await page.keyboard.down('Enter')

  const value = await page.evaluate(async () => window.testState.withPress.status.value),
        expected = 'pressed'

  assert.is(value, expected)
})

suite('sets status to released', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useWithPress/withUrlOptions')
  await page.waitForSelector('button', { state: 'attached' })

  await page.focus('button')
  await page.keyboard.down('Enter')
  await page.keyboard.up('Enter')

  const value = await page.evaluate(async () => window.testState.withPress.status.value),
        expected = 'released'

  assert.is(value, expected)
})

suite('sets press via keyboard', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useWithPress/withUrlOptions')
  await page.waitForSelector('button', { state: 'attached' })

  await page.focus('button')
  await page.keyboard.down('Enter')

  const value = await page.evaluate(async () => window.testState.withPress.press.value.pointerType),
        expected = 'keyboard'

  assert.is(value, expected)
})

suite('sets press via mouse', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useWithPress/withUrlOptions')
  await page.waitForSelector('button', { state: 'attached' })

  const { top, left } = await page.evaluate(() => {
    return document.querySelector('button').getBoundingClientRect()
  })
  await page.mouse.move(left, top)
  await page.mouse.down()

  const value = await page.evaluate(async () => window.testState.withPress.press.value.pointerType),
        expected = 'mouse'

  assert.is(value, expected)
})

suite('sets release via keyboard', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useWithPress/withUrlOptions')
  await page.waitForSelector('button', { state: 'attached' })

  await page.focus('button')
  await page.keyboard.down('Enter')
  await page.keyboard.up('Enter')

  const value = await page.evaluate(async () => window.testState.withPress.release.value.pointerType),
        expected = 'keyboard'

  assert.is(value, expected)
})

suite('sets release via mouse', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/useWithPress/withUrlOptions')
  await page.waitForSelector('button', { state: 'attached' })

  const { top, left } = await page.evaluate(() => {
    return document.querySelector('button').getBoundingClientRect()
  })
  await page.mouse.move(left, top)
  await page.mouse.down()
  await page.mouse.up()

  const value = await page.evaluate(async () => window.testState.withPress.release.value.pointerType),
        expected = 'mouse'

  assert.is(value, expected)
})

suite('doesn\'t set press via keyboard when keyboard is false', async ({ playwright: { page } }) => {
  const options = {
    press: { keyboard: false },
  }
  await page.goto(`http://localhost:5173/useWithPress/withUrlOptions${toOptionsParam(options)}`)
  await page.waitForSelector('button', { state: 'attached' })

  await page.focus('button')
  await page.keyboard.down('Enter')

  const value = await page.evaluate(async () => window.testState.withPress.press.value),
        expected = undefined

  assert.is(value, expected)
})

suite('doesn\'t set press via mouse when mouse is false', async ({ playwright: { page } }) => {
  const options = {
    press: { mouse: false },
  }
  await page.goto(`http://localhost:5173/useWithPress/withUrlOptions${toOptionsParam(options)}`)
  await page.waitForSelector('button', { state: 'attached' })

  const { top, left } = await page.evaluate(() => {
    return document.querySelector('button').getBoundingClientRect()
  })
  await page.mouse.move(left, top)
  await page.mouse.down()

  const value = await page.evaluate(async () => window.testState.withPress.press.value),
        expected = undefined

  assert.is(value, expected)
})

suite('doesn\'t set release via keyboard when keyboard is false', async ({ playwright: { page } }) => {
  const options = {
    release: { keyboard: false },
  }
  await page.goto(`http://localhost:5173/useWithPress/withUrlOptions${toOptionsParam(options)}`)
  await page.waitForSelector('button', { state: 'attached' })

  await page.focus('button')
  await page.keyboard.down('Enter')
  await page.keyboard.up('Enter')

  const value = await page.evaluate(async () => window.testState.withPress.release.value),
        expected = undefined

  assert.is(value, expected)
})

suite('doesn\'t set release via mouse when mouse is false', async ({ playwright: { page } }) => {
  const options = {
    release: { mouse: false },
  }
  await page.goto(`http://localhost:5173/useWithPress/withUrlOptions${toOptionsParam(options)}`)
  await page.waitForSelector('button', { state: 'attached' })

  const { top, left } = await page.evaluate(() => {
    return document.querySelector('button').getBoundingClientRect()
  })
  await page.mouse.move(left, top)
  await page.mouse.down()
  await page.mouse.up()

  const value = await page.evaluate(async () => window.testState.withPress.release.value),
        expected = undefined

  assert.is(value, expected)
})

suite.run()
