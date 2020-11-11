const { generateIndex, empty } = require('@baleada/prepare'),
      compile = require('./compile')

function prepare () {
  /* Empty destinations */
  empty('lib')
  generateIndex('src/util')
}

prepare()
