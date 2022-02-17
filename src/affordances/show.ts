import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { some } from 'lazy-collections'
import { scheduleBind, toAffordanceElementType } from '../extracted'
import type { BindElement, BindValue, AffordanceElementType } from '../extracted'
import { BindReactiveValueGetter, ensureValue, ensureWatchSourceOrSources } from './bind'
import { Listenable } from '@baleada/logic'

export type ShowOptions<BindElementType extends BindElement> = {
  transition?: TransitionOption<BindElementType>
}

export type TransitionOption<BindElementType extends BindElement> = {
  appear?: TransitionCss | TransitionJs<BindElementType> | true | ((defineTransition: DefineTransition<BindElementType>) => ReturnType<DefineTransition<BindElementType>>),
  enter?: TransitionCss | TransitionJs<BindElementType> | ((defineTransition: DefineTransition<BindElementType>) => ReturnType<DefineTransition<BindElementType>>),
  leave?: TransitionCss | TransitionJs<BindElementType> | ((defineTransition: DefineTransition<BindElementType>) => ReturnType<DefineTransition<BindElementType>>),
}

export type TransitionCss = {
  from: string,
  active: string,
  to: string,
  end?: () => void,
  // cancel?: string,
}

export type TransitionJs<BindElementType extends BindElement> = {
  before?: BindElementType extends HTMLElement | Ref<HTMLElement>
    ? () => any
    : (index: number) => any
  active?: BindElementType extends HTMLElement | Ref<HTMLElement>
    ? (done: () => void) => any
    : (index: number, done: () => void) => any
  after?: BindElementType extends HTMLElement | Ref<HTMLElement>
    ? () => any
    : (index: number) => any
  cancel?: BindElementType extends HTMLElement | Ref<HTMLElement>
    ? () => any
    : (index: number) => any
}

export function show<BindElementType extends BindElement> (
  elementOrElements: BindElementType,
  condition: BindValue<boolean> | BindReactiveValueGetter<boolean>,
  options: ShowOptions<BindElementType> = {},
) {
  const originalDisplays = new WeakMap<HTMLElement, string>(),
        cancels = new WeakMap<HTMLElement, undefined | (() => boolean)>(),
        statuses = new WeakMap<HTMLElement, 'appeared'>(),
        { transition: transitionOption = {} } = options,
        affordanceElementType = toAffordanceElementType(elementOrElements),
        defineTransition = createDefineTransition<BindElementType>(),
        { appear, enter, leave } = ensureTransitions(transitionOption, defineTransition),
        transitionTypes = toTransitionTypes({ appear, enter, leave })

  scheduleBind<boolean>(
    {
      elementOrElements,
      assign: ({ element, value, index }) => {
        const didCancel = cancels.get(element)?.()

        if (!originalDisplays.get(element)) {
          const originalDisplay = window.getComputedStyle(element).display
          originalDisplays.set(element, originalDisplay === 'none' ? 'block' : originalDisplay) // TODO: Is block a sensible default? Is it necessary? Is there a better way to get the default display a particular tag would have?
        }

        const originalDisplay = originalDisplays.get(element)

        if (didCancel) {
          cancels.set(element, undefined)

          if (value) {
            // Transition canceled, element should be shown
            if ((element as HTMLElement).style.display === originalDisplay) {
              return
            }

            (element as HTMLElement).style.display = originalDisplay
            return
          }

          // Transition canceled, element should not be shown
          (element as HTMLElement).style.display = 'none'
          return
        }

        // Leave
        if (!value) {
          if ((element as HTMLElement).style.display === 'none') {
            return
          }

          if (statuses.get(element) !== 'appeared') {
            (element as HTMLElement).style.display = 'none'
            return
          }

          if (transitionTypes.leave === 'none') {
            (element as HTMLElement).style.display = 'none'
            return
          }

          if (transitionTypes.leave === 'css') {
            transitionCss(element, {
              ...(leave as TransitionCss),
              start: addFrom => addFrom(),
              end: removeTo => {
                (element as HTMLElement).style.display = 'none'
                removeTo();
                (leave as TransitionCss).end?.()
              },
            })
            return
          }
  
          if (transitionTypes.leave === 'js') {
            const cancel = transitionJs(
              affordanceElementType,
              {
                index,
                before: (leave as TransitionJs<BindElementType>).before,
                start: () => {},
                active: (leave as TransitionJs<BindElementType>).active,
                end: status => {
                  if (status === 'canceled') {
                    return
                  }
      
                  (element as HTMLElement).style.display = 'none'
                },
                after: (leave as TransitionJs<BindElementType>).after,
                cancel: (leave as TransitionJs<BindElementType>).cancel,
              } as TransitionJsConfig<typeof affordanceElementType>
            )
    
            cancels.set(element, cancel)
            return
          }
          
        }

        if (value) {
          // Set up for enter or appear-as-enter
          function enterEffect () {
            if ((element as HTMLElement).style.display === originalDisplay) {
              return
            }

            if (transitionTypes.enter === 'none') {
              (element as HTMLElement).style.display = originalDisplay
              return
            }

            if (transitionTypes.enter === 'css') {
              transitionCss(element, {
                ...(enter as TransitionCss),
                start: addFrom => {
                  addFrom();
                  (element as HTMLElement).style.display = originalDisplay
                },
                end: removeTo => {
                  removeTo();
                  (enter as TransitionCss).end?.()
                },
              })
              return
            }

            if (transitionTypes.enter === 'js') {
              const cancel = transitionJs(
                affordanceElementType,
                {
                  index,
                  before: (enter as TransitionJs<BindElementType>).before,
                  start: () => ((element as HTMLElement).style.display = originalDisplay),
                  active: (enter as TransitionJs<BindElementType>).active,
                  end: () => {},
                  after: (enter as TransitionJs<BindElementType>).after,
                  cancel: (enter as TransitionJs<BindElementType>).cancel,
                } as TransitionJsConfig<typeof affordanceElementType>
              )
    
              cancels.set(element, cancel)
              return
            }
          }

          // Appear
          if (statuses.get(element) !== 'appeared') {
            statuses.set(element, 'appeared')

            if ((element as HTMLElement).style.display === originalDisplay) {
              // TODO: Should actually appear here
              return
            }

            if (transitionTypes.appear === 'none') {
              (element as HTMLElement).style.display = originalDisplay
              return
            }

            if (transitionTypes.appear === 'css') {
              transitionCss(element, {
                ...(appear as TransitionCss),
                start: addFrom => {
                  addFrom();
                  (element as HTMLElement).style.display = originalDisplay
                },
                end: removeTo => {
                  removeTo();
                  (appear as TransitionCss).end?.()
                },
              })
              return
            }

            if (transitionTypes.appear === 'js') {
              const hooks = (
                (transitionOption?.appear === true && transitionOption?.enter)
                ||
                (transitionOption?.appear === false && {})
                ||
                (transitionOption?.appear)
              )
    
              const cancel = transitionJs(
                affordanceElementType,
                {
                  index,
                  before: (hooks as TransitionJs<BindElementType>)?.before,
                  start: () => ((element as HTMLElement).style.display = originalDisplay),
                  active: (hooks as TransitionJs<BindElementType>)?.active,
                  end: () => {},
                  after: (hooks as TransitionJs<BindElementType>)?.after,
                  cancel: (hooks as TransitionJs<BindElementType>)?.cancel,
                } as TransitionJsConfig<typeof affordanceElementType>
              )
    
              cancels.set(element, cancel)
              return
            }

            if (transitionTypes.appear === 'enter') {
              enterEffect()
              return
            }
          }

          enterEffect()
        }
      },
      remove: () => {},
      value: ensureValue(condition) as BindValue<boolean>,
      watchSources: ensureWatchSourceOrSources(condition),
    }
  )
}

type DefineTransition<BindElementType extends BindElement> = <TransitionType extends 'css' | 'js'>(
  type: TransitionType,
  transition: TransitionType extends 'css' ? TransitionCss : TransitionJs<BindElementType>
) => TransitionType extends 'css' ? TransitionCss : TransitionJs<BindElementType>

export function createDefineTransition<BindElementType extends BindElement> (): DefineTransition<BindElementType> {
  return (css, transition) => {
    return transition
  }
}

type TransitionJsConfig<A extends AffordanceElementType> = A extends 'single'
  ? {
    index: number,
    before: TransitionJs<HTMLElement>['before'],
    start: () => void,
    active: TransitionJs<HTMLElement>['active'],
    end: (status: TransitionStatus) => void,
    after: TransitionJs<HTMLElement>['after'],
    cancel: TransitionJs<HTMLElement>['cancel'],
  }
  : {
    index: number,
    before: TransitionJs<HTMLElement[]>['before'],
    start: () => void,
    active: TransitionJs<HTMLElement[]>['active'],
    end: (status: TransitionStatus) => void,
    after: TransitionJs<HTMLElement[]>['after'],
    cancel: TransitionJs<HTMLElement[]>['cancel'],
  }

type TransitionStatus = 'ready' | 'transitioning' | 'transitioned' | 'canceled'

function transitionJs<A extends AffordanceElementType> (
  affordanceElementType: A,
  config: TransitionJsConfig<A>,
) {
  const { index } = config,
        { before, start, active, end, after, cancel } = (() => {
          if (affordanceElementType === 'single') {
            return {
              before: () => (config as TransitionJsConfig<'single'>).before?.(),
              start: () => config.start?.(),
              active: () => (config as TransitionJsConfig<'single'>).active?.(done),
              end: () => config.end?.(status.value),
              after: () => (config as TransitionJsConfig<'single'>).after?.(),
              cancel: () => (config as TransitionJsConfig<'single'>).cancel?.(),
            }
          }

          return {
            before: () => (config as TransitionJsConfig<'multiple'>).before?.(index),
            start: () => config.start?.(),
            active: () => (config as TransitionJsConfig<'multiple'>).active?.(index, done),
            end: () => config.end?.(status.value),
            after: () => (config as TransitionJsConfig<'multiple'>).after?.(index),
            cancel: () => (config as TransitionJsConfig<'multiple'>).cancel?.(index),
          }
        })(),
        status = ref<TransitionStatus>('ready'),
        done = () => {
          stopWatchingStatus()
          end()

          if (status.value === 'canceled') {
            return
          }

          after()
          status.value = 'transitioned'
        }

  before()
  
  start()
  status.value = 'transitioning'

  // TODO: Watcher may not be necessary
  const stopWatchingStatus = watch(
    status,
    () => {
      if (status.value === 'canceled') {
        cancel()
        done()
      }
    },
    { flush: 'post' }
  )

  if (config.active) {
    active()
  } else {
    done()
  }

  return () => {
    if (status.value === 'transitioned') {
      return false
    }
    
    status.value = 'canceled'
    return true
  }
}

type TransitionCssConfig = Omit<TransitionCss, 'end'> & {
  start: (addFrom: () => void) => void,
  end: (removeTo: () => void) => void,
}

function transitionCss (element: HTMLElement, config: TransitionCssConfig) {
  const from = config.from.split(' ') || [],
        active = config.active.split(' ') || [],
        to = config.to.split(' ') || []
        
  const addFrom = () => element.classList.add(...from)
  config.start(addFrom)

  const transitionend = new Listenable('transitionend')

  transitionend.listen(() => {
    transitionend.stop()

    requestAnimationFrame(() => {
      const removeTo = () => element.classList.remove(...active, ...to)
      config.end(removeTo)
    })
  })

  requestAnimationFrame(() => {
    element.classList.add(...active)
    
    requestAnimationFrame(() => {
      element.classList.remove(...from)
      element.classList.add(...to)
    })
  })
}

export function ensureTransitions<BindElementType extends BindElement> (transitionOption: TransitionOption<BindElementType>, defineTransition: DefineTransition<BindElementType>): TransitionOption<BindElementType> {
  const ensuredTransitions: {
    appear?: TransitionCss | TransitionJs<BindElementType> | true
    enter?: TransitionCss | TransitionJs<BindElementType>
    leave?: TransitionCss | TransitionJs<BindElementType>
  } = {}

  for (const key of ['appear', 'enter', 'leave']) {
    if (typeof transitionOption[key] === 'function') {
      ensuredTransitions[key] = transitionOption[key](defineTransition)
      continue
    }

    if (typeof transitionOption[key] === 'object' || transitionOption[key] === true) {
      ensuredTransitions[key] = transitionOption[key]
      continue
    }

    ensuredTransitions[key] = {}
  }
  
  return ensuredTransitions
}

export function toTransitionTypes<BindElementType extends BindElement>({ appear, enter, leave }: TransitionOption<BindElementType>): {
  appear: 'css' | 'js' | 'none' | 'enter',
  enter: 'css' | 'js' | 'none',
  leave: 'css' | 'js' | 'none',
} {
  const enterType = (() => {
          if ('from' in enter) return 'css'
          if (some<string>(key => key in enter)(['before', 'active', 'leave', 'cancel'])) return 'js'
          return 'none'
        })(),
        leaveType = (() => {
          if ('from' in leave) return 'css'
          if (some<string>(key => key in leave)(['before', 'active', 'leave', 'cancel'])) return 'js'
          return 'none'
        })(),
        appearType = (() => {
          if (appear === true) return 'enter'
          if ('from' in appear) return 'css'
          if (some<string>(key => key in appear)(['before', 'active', 'leave', 'cancel'])) return 'js'
          return 'none'
        })()

  return {
    appear: appearType,
    enter: enterType,
    leave: leaveType,
  }
}
