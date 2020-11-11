const { generateIndex, empty } = require('@baleada/prepare')

function prepare () {
  /* Empty destinations */
  empty('lib')
  empty('util')
}

prepare()
