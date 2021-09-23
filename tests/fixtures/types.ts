import * as affordances from '../../src/affordances'
import * as functions from '../../src/interfaces'
import * as extracted from '../../src/extracted'

export type WithGlobals = Window & {
  Features: typeof affordances & typeof functions,
  Features_functions: typeof functions,
  Features_affordances: typeof affordances,
  Features_extracted: typeof extracted,
  nextTick: () => Promise<any>,
  testState: any
}
