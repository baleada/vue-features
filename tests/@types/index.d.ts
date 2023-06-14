import * as affordances from '../../src/affordances'
import * as combos from '../../src/combos'
import * as extensions from '../../src/extensions'
import * as extracted from '../../src/extracted'
import * as interfaces from '../../src/interfaces'

type Globals = {
  Features: typeof affordances & typeof combos & typeof extensions & typeof extracted & typeof interfaces,
  nextTick: () => Promise<any>,
  testState: any,
}

declare global {
  interface Window extends Globals {}
}
