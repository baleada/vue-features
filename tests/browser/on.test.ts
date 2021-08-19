import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'
import { WithGlobals } from '../fixtures/types'

const suite = withPuppeteer(
  createSuite('on')
)

suite(`adds event listeners when component is mounted`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/on/Parent')
  await page.waitForSelector('span')

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
  await page.goto('http://localhost:3000/on/Parent')
  await page.waitForSelector('span')

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

suite(`adds event listeners via createEffect on arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/on/ParentArray')
  await page.waitForSelector('span')

  await page.click('span:nth-child(1)')
  await page.click('span:nth-child(2)')
  await page.click('span:nth-child(3)')
  const from = await page.evaluate(() => [...(window as unknown as WithGlobals).testState.counts.value])
  assert.equal(from, [0, 0, 0])

  // Mounting the child component causes listeners to be added
  await page.evaluate(async () => {
    (window as unknown as WithGlobals).testState.mount()
    await (window as unknown as WithGlobals).nextTick()
  })
  await page.waitForSelector('div') // Ensure child has mounted
  
  await page.click('span:nth-child(1)')
  const stop1 = await page.evaluate(() => [...(window as unknown as WithGlobals).testState.counts.value])
  assert.equal(stop1, [1, 0, 0])
  
  await page.click('span:nth-child(2)')
  const stop2 = await page.evaluate(() => [...(window as unknown as WithGlobals).testState.counts.value])
  assert.equal(stop2, [1, 1, 0])
  
  await page.click('span:nth-child(3)')
  const stop3 = await page.evaluate(() => [...(window as unknown as WithGlobals).testState.counts.value])
  assert.equal(stop3, [1, 1, 1])
})

suite(`can permanently remove listeners via the off() callback passed to createEffect`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/on/off')
  await page.waitForSelector('span')

  // Initial span text is 0
  await page.click('span')
  const from = await page.evaluate(() => {
          return Number(document.querySelector('code').textContent)
        })

  assert.is(from, 1)

  // `off is called in the first callback`.
  await page.click('span')
  const to = await page.evaluate(async () => {
          return Number(document.querySelector('code').textContent)
        })
  
  assert.is(to, 1)
})

suite.run()
