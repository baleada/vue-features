import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPlaywright } from '@baleada/prepare'
import { toOptionsParam } from '../../toParam'

const suite = withPlaywright(
  createSuite('usePopup')
)

suite('open() opens', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePopup')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.popup.open()
          await window.nextTick()
          return window.testState.popup.status.value
        }),
        expected = 'opened'

  assert.is(value, expected)
})

suite('close() closes', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePopup')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.popup.open()
          await window.nextTick()
          window.testState.popup.close()
          await window.nextTick()
          return window.testState.popup.status.value
        }),
        expected = 'closed'

  assert.is(value, expected)
})

suite('respects initialStatus option', async ({ playwright: { page } }) => {
  const options = { initialStatus: 'opened' }
  const url = `http://localhost:5173/usePopup/withUrlOptions${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return window.testState.popup.status.value
        }),
        expected = 'opened'

  assert.is(value, expected)
})

suite('when trapsFocus is true, contains focus when tabbing before first focusable', async ({ playwright: { page, tab } }) => {
  const options = { initialStatus: 'opened' }
  const url = `http://localhost:5173/usePopup/withUrlOptions${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('span', { state: 'attached' })

  await page.focus('input')
  await tab({ direction: 'forward', total: 1 })
  await tab({ direction: 'backward', total: 1 })

  const value = await page.evaluate(() => document.activeElement.textContent)

  assert.is(value, 'third', url)
})

suite('when trapsFocus is true, contains focus when tabbing past last focusable', async ({ playwright: { page, tab } }) => {
  const options = { initialStatus: 'opened' }
  const url = `http://localhost:5173/usePopup/withUrlOptions${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('span', { state: 'attached' })

  await page.focus('input')
  await tab({ direction: 'forward', total: 4 })

  const value = await page.evaluate(() => document.activeElement.textContent)

  assert.is(value, 'first', url)
})

suite('when trapsFocus is true, keeps focus in place when clicking outside', async ({ playwright: { page, tab } }) => {
  const options = { initialStatus: 'opened' }
  const url = `http://localhost:5173/usePopup/withUrlOptions${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('span', { state: 'attached' })

  await page.focus('input')
  await tab({ direction: 'forward', total: 1 })
  await page.click('body')

  const value = await page.evaluate(() => document.activeElement.textContent)

  assert.is(value, 'first', url)
})

suite('when trapsFocus is false, does not contain focus when tabbing before first focusable', async ({ playwright: { page, tab } }) => {
  const options = { initialStatus: 'opened', trapsFocus: false }
  const url = `http://localhost:5173/usePopup/withUrlOptions${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('span', { state: 'attached' })

  await page.focus('input')
  await tab({ direction: 'forward', total: 1 })
  await tab({ direction: 'backward', total: 1 })

  const value = await page.evaluate(() => document.activeElement.id)

  assert.is(value, 'before', url)
})

suite('when trapsFocus is false, does not contain focus when tabbing past last focusable', async ({ playwright: { page, tab } }) => {
  const options = { initialStatus: 'opened', trapsFocus: false }
  const url = `http://localhost:5173/usePopup/withUrlOptions${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('span', { state: 'attached' })

  await page.focus('input')
  await tab({ direction: 'forward', total: 4 })

  const value = await page.evaluate(() => document.activeElement.id)

  assert.is(value, 'after', url)
})

suite('when trapsFocus is false, does not keep focus in place when clicking outside', async ({ playwright: { page, tab } }) => {
  const options = { initialStatus: 'opened', trapsFocus: false }
  const url = `http://localhost:5173/usePopup/withUrlOptions${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('span', { state: 'attached' })

  await page.focus('input')
  await tab({ direction: 'forward', total: 1 })
  await page.click('body')

  const value = await page.evaluate(() => document.activeElement.id)

  assert.is(value, '', url)
})

suite('when managesScrollAllowance is true, disallows scroll when opened', async ({ playwright: { page } }) => {
  const options = { initialStatus: 'opened' }
  const url = `http://localhost:5173/usePopup/manageScrollAllowanceWithUrlOptions${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return getComputedStyle(document.documentElement).overflow
        }),
        expected = 'hidden'

  assert.is(value, expected, url)
})

suite('when managesScrollAllowance is true, allows scroll when closed', async ({ playwright: { page } }) => {
  const options = { initialStatus: 'opened' }
  const url = `http://localhost:5173/usePopup/manageScrollAllowanceWithUrlOptions${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.popup.close()
          await window.nextTick()
          return getComputedStyle(document.documentElement).overflow
        }),
        expected = 'visible'

  assert.is(value, expected, url)
})

suite('when managesScrollAllowance is true, allows scroll when scope disposed', async ({ playwright: { page } }) => {
  await page.goto('http://localhost:5173/usePopup/onScopeDispose')
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          window.testState.popup.open()
          await window.nextTick()
          window.testState.scopedIsRendered.value = false
          await window.nextTick()
          return getComputedStyle(document.documentElement).overflow
        }),
        expected = 'visible'

  assert.is(value, expected)
})

suite('when managesScrollAllowance is false, allows scroll when opened', async ({ playwright: { page } }) => {
  const options = { initialStatus: 'opened', managesScrollAllowance: false }
  const url = `http://localhost:5173/usePopup/manageScrollAllowanceWithUrlOptions${toOptionsParam(options)}`
  await page.goto(url)
  await page.waitForSelector('span', { state: 'attached' })

  const value = await page.evaluate(async () => {
          return getComputedStyle(document.documentElement).overflow
        }),
        expected = 'visible'

  assert.is(value, expected, url)
})

suite.run()
