const { generateIndex, empty } = require('@baleada/prepare'),
      compile = require('./compile')

function prepare () {
  /* Empty destinations */
  empty('lib')

  /* Index all */
  generateIndex('src')
  generateIndex('src/util')

  /* Rollup */
  compile()
}

prepare()
