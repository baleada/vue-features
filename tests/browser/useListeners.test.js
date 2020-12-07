import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useListeners (browser)')
)

suite(`adds event listeners when component is mounted`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useListeners/Parent')

  // Initial span text is 0
  await page.click('span')
  const thereIsNoInitialListener = await page.evaluate(() => {
          return Number(document.querySelector('span').textContent) === 0
        })

  assert.ok(thereIsNoInitialListener)

  // Clicking the button mounts a component that will 
  // add a click listener to the span.
  await page.click('button')
  await page.waitForSelector('div')
  await page.click('span')
  const thereIsAListenerAfterMount = await page.evaluate(async () => {
          return Number(document.querySelector('span').textContent) === 1
        })
  
  assert.ok(thereIsAListenerAfterMount)
})

suite(`removes event listeners after component is unmounted`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/useListeners/Parent')

  // Initial span text is 0
  await page.click('span')
  const thereIsNoInitialListener = await page.evaluate(() => {
          return Number(document.querySelector('span').textContent) === 0
        })

  assert.ok(thereIsNoInitialListener)

  // Clicking the button mounts a component that will 
  // add a click listener to the span.
  await page.click('button')
  await page.waitForSelector('div')
  await page.click('span')
  const thereIsAListenerAfterMount = await page.evaluate(async () => {
          return Number(document.querySelector('span').textContent) === 1
        })
  
  assert.ok(thereIsAListenerAfterMount)

  // Clicking the button unmounts the component that added
  // the listener.
  await page.click('button')
  await page.click('span')
  const thereIsNoListenerAfterMount = await page.evaluate(async () => {
          return Number(document.querySelector('span').textContent) === 1
        })

  assert.ok(thereIsNoListenerAfterMount)
})

suite.run()
