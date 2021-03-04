import { suite as createSuite } from 'uvu'
import * as assert from 'uvu/assert'
import { withPuppeteer } from '@baleada/prepare'

const suite = withPuppeteer(
  createSuite('useInput (browser)')
)

// models input value on completeable string
// models input selection on completeable selection
//    - mouseup
//    - focus
//    - arrow keys
//    - arrow keys + meta

suite.run()
