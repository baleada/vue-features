import useListeners from './useListeners.js'

export default function useModel ({ target, value, attribute, watchSources }) {
  useListeners({
    target,
    listeners: {
      input: ({ target: { value: input } }) => {
        value.value = input
      }
    }
  })

  useBindings({
    target,
    bindings: { [attribute]: value }
  })
}
