// import type * as affordances from '../../src/affordances'
// import type * as combos from '../../src/combos'
// import type * as extensions from '../../src/extensions'
// import type * as extracted from '../../src/extracted'
// import type * as interfaces from '../../src/interfaces'

interface Window {
  // Features: typeof affordances & typeof combos & typeof extensions & typeof extracted & typeof interfaces,
  nextTick: () => Promise<any>,
  testState: any,
}
