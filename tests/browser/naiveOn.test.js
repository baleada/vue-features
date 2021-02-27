import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('naiveOn (browser)')
)

suite(`removes event listeners after component is unmounted`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/naiveOn/Parent')
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

suite(`adds event listeners via the target closure on arrays of elements`, async ({ puppeteer: { page } }) => {
  await page.goto('http://localhost:3000/naiveOn/ParentArray')
  await page.waitForSelector('span')

  await page.click('span:nth-child(1)')
  await page.click('span:nth-child(2)')
  await page.click('span:nth-child(3)')
  const first = await page.evaluate(() => [...window.TEST.counts.value])
  assert.equal(first, [0, 0, 0])

  // Mounting the child component causes listeners to be added
  await page.evaluate(async () => {
    window.TEST.mount()
    await window.nextTick()
  })
  await page.waitForSelector('div') // Ensure child has mounted
  
  await page.click('span:nth-child(1)')
  const stop1 = await page.evaluate(() => [...window.TEST.counts.value])
  assert.equal(stop1, [1, 0, 0])
  
  await page.click('span:nth-child(2)')
  const stop2 = await page.evaluate(() => [...window.TEST.counts.value])
  assert.equal(stop2, [1, 1, 0])
  
  await page.click('span:nth-child(3)')
  const stop3 = await page.evaluate(() => [...window.TEST.counts.value])
  assert.equal(stop3, [1, 1, 1])
  
  await page.click('span:nth-child(1)')
  const stop4 = await page.evaluate(() => [...window.TEST.counts.value])
  assert.equal(stop4, [2, 1, 1])
  
  await page.click('span:nth-child(2)')
  const stop5 = await page.evaluate(() => [...window.TEST.counts.value])
  assert.equal(stop5, [2, 2, 1])
  
  await page.click('span:nth-child(3)')
  const stop6 = await page.evaluate(() => [...window.TEST.counts.value])
  assert.equal(stop6, [2, 2, 2])
})

suite.run()
