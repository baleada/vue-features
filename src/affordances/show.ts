import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { some } from 'lazy-collections'
import { scheduleBind, toAffordanceElementKind } from '../extracted'
import type { BindElement, BindValue, AffordanceElementKind } from '../extracted'
import { BindReactiveValueGetter, ensureValue, ensureWatchSourceOrSources } from './bind'
import { Listenable } from '@baleada/logic'

export type ShowOptions<B extends BindElement> = {
  transition?: TransitionOption<B>
}

export type TransitionOption<B extends BindElement> = {
  appear?: TransitionCss | TransitionJs<B> | true | ((defineTransition: DefineTransition<B>) => ReturnType<DefineTransition<B>>),
  enter?: TransitionCss | TransitionJs<B> | ((defineTransition: DefineTransition<B>) => ReturnType<DefineTransition<B>>),
  leave?: TransitionCss | TransitionJs<B> | ((defineTransition: DefineTransition<B>) => ReturnType<DefineTransition<B>>),
}

export type TransitionCss = {
  from: string,
  active: string,
  to: string,
  end?: () => void,
  // cancel?: string,
}

export type TransitionJs<B extends BindElement> = {
  before?: B extends HTMLElement | Ref<HTMLElement>
    ? () => any
    : B extends HTMLElement[] | Ref<HTMLElement[]>
      ? (index: number) => any
      : (row: number, column: number) => any,
  active?: B extends HTMLElement | Ref<HTMLElement>
    ? (done: () => void) => any
    : B extends HTMLElement[] | Ref<HTMLElement[]>
      ? (index: number, done: () => void) => any
      : (row: number, column: number, done: () => void) => any,
  after?: B extends HTMLElement | Ref<HTMLElement>
    ? () => any
    : B extends HTMLElement[] | Ref<HTMLElement[]>
      ? (index: number) => any
      : (row: number, column: number) => any,
  cancel?: B extends HTMLElement | Ref<HTMLElement>
    ? () => any
    : B extends HTMLElement[] | Ref<HTMLElement[]>
      ? (index: number) => any
      : (row: number, column: number) => any,
}

export function show<B extends BindElement> (
  elementOrListOrPlane: B,
  condition: BindValue<B, boolean> | BindReactiveValueGetter<B, boolean>,
  options: ShowOptions<B> = {},
) {
  const originalDisplays = new WeakMap<HTMLElement, string>(),
        cancels = new WeakMap<HTMLElement, undefined | (() => boolean)>(),
        statuses = new WeakMap<HTMLElement, 'appeared'>(),
        { transition: transitionOption = {} } = options,
        affordanceElementKind = toAffordanceElementKind(elementOrListOrPlane),
        defineTransition = createDefineTransition<B>(),
        { appear, enter, leave } = ensureTransitions(transitionOption, defineTransition),
        transitionTypes = toTransitionTypes({ appear, enter, leave })

  scheduleBind<B, boolean>(
    
    elementOrListOrPlane,
    (element, value, row, column) => {
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
            affordanceElementKind,
            {
              column,
              row,
              before: (leave as TransitionJs<B>).before,
              start: () => {},
              active: (leave as TransitionJs<B>).active,
              end: status => {
                if (status === 'canceled') {
                  return
                }
    
                (element as HTMLElement).style.display = 'none'
              },
              after: (leave as TransitionJs<B>).after,
              cancel: (leave as TransitionJs<B>).cancel,
            } as TransitionJsConfig<typeof affordanceElementKind>
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
              affordanceElementKind,
              {
                row,
                column,
                before: (enter as TransitionJs<B>).before,
                start: () => ((element as HTMLElement).style.display = originalDisplay),
                active: (enter as TransitionJs<B>).active,
                end: () => {},
                after: (enter as TransitionJs<B>).after,
                cancel: (enter as TransitionJs<B>).cancel,
              } as TransitionJsConfig<typeof affordanceElementKind>
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
              affordanceElementKind,
              {
                row,
                column,
                before: (hooks as TransitionJs<B>)?.before,
                start: () => ((element as HTMLElement).style.display = originalDisplay),
                active: (hooks as TransitionJs<B>)?.active,
                end: () => {},
                after: (hooks as TransitionJs<B>)?.after,
                cancel: (hooks as TransitionJs<B>)?.cancel,
              } as TransitionJsConfig<typeof affordanceElementKind>
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
    () => {},
    ensureValue(condition) as BindValue<B, boolean>,
    ensureWatchSourceOrSources(condition),
  )
}

type DefineTransition<B extends BindElement> = <TransitionType extends 'css' | 'js'>(
  type: TransitionType,
  transition: TransitionType extends 'css' ? TransitionCss : TransitionJs<B>
) => TransitionType extends 'css' ? TransitionCss : TransitionJs<B>

export function createDefineTransition<B extends BindElement> (): DefineTransition<B> {
  return (css, transition) => {
    return transition
  }
}

type TransitionJsConfig<A extends AffordanceElementKind> = A extends 'element'
  ? {
    row: 0,
    column: 0,
    before: TransitionJs<HTMLElement>['before'],
    start: () => void,
    active: TransitionJs<HTMLElement>['active'],
    end: (status: TransitionStatus) => void,
    after: TransitionJs<HTMLElement>['after'],
    cancel: TransitionJs<HTMLElement>['cancel'],
  }
  : A extends 'list'
    ? {
      row: 0,
      column: number,
      before: TransitionJs<HTMLElement[]>['before'],
      start: () => void,
      active: TransitionJs<HTMLElement[]>['active'],
      end: (status: TransitionStatus) => void,
      after: TransitionJs<HTMLElement[]>['after'],
      cancel: TransitionJs<HTMLElement[]>['cancel'],
    }
    : {
      row: number,
      column: number,
      before: TransitionJs<Map<number, HTMLElement[]>>['before'],
      start: () => void,
      active: TransitionJs<Map<number, HTMLElement[]>>['active'],
      end: (status: TransitionStatus) => void,
      after: TransitionJs<Map<number, HTMLElement[]>>['after'],
      cancel: TransitionJs<Map<number, HTMLElement[]>>['cancel'],
    }

type TransitionStatus = 'ready' | 'transitioning' | 'transitioned' | 'canceled'

function transitionJs<A extends AffordanceElementKind> (
  affordanceElementKind: A,
  config: TransitionJsConfig<A>,
) {
  const { row, column } = config,
        { before, start, active, end, after, cancel } = (() => {
          if (affordanceElementKind === 'plane') {
            return {
              before: () => (config as TransitionJsConfig<'plane'>).before?.(row, column),
              start: () => config.start?.(),
              active: () => (config as TransitionJsConfig<'plane'>).active?.(row, column, done),
              end: () => config.end?.(status.value),
              after: () => (config as TransitionJsConfig<'plane'>).after?.(row, column),
              cancel: () => (config as TransitionJsConfig<'plane'>).cancel?.(row, column),
            }
          }

          if (affordanceElementKind === 'list') {
            return {
              before: () => (config as TransitionJsConfig<'list'>).before?.(column),
              start: () => config.start?.(),
              active: () => (config as TransitionJsConfig<'list'>).active?.(column, done),
              end: () => config.end?.(status.value),
              after: () => (config as TransitionJsConfig<'list'>).after?.(column),
              cancel: () => (config as TransitionJsConfig<'list'>).cancel?.(column),
            }
          }

          return {
            before: () => (config as TransitionJsConfig<'element'>).before?.(),
            start: () => config.start?.(),
            active: () => (config as TransitionJsConfig<'element'>).active?.(done),
            end: () => config.end?.(status.value),
            after: () => (config as TransitionJsConfig<'element'>).after?.(),
            cancel: () => (config as TransitionJsConfig<'element'>).cancel?.(),
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

export function ensureTransitions<B extends BindElement> (transitionOption: TransitionOption<B>, defineTransition: DefineTransition<B>): TransitionOption<B> {
  const ensuredTransitions: {
    appear?: TransitionCss | TransitionJs<B> | true
    enter?: TransitionCss | TransitionJs<B>
    leave?: TransitionCss | TransitionJs<B>
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

export function toTransitionTypes<B extends BindElement>({ appear, enter, leave }: TransitionOption<B>): {
  appear: 'css' | 'js' | 'none' | 'enter',
  enter: 'css' | 'js' | 'none',
  leave: 'css' | 'js' | 'none',
} {
  const enterType = (() => {
          if ('from' in enter) return 'css'
          if (some<keyof TransitionJs<B>>(key => key in enter)(['before', 'active', 'after', 'cancel'])) return 'js'
          return 'none'
        })(),
        leaveType = (() => {
          if ('from' in leave) return 'css'
          if (some<keyof TransitionJs<B>>(key => key in leave)(['before', 'active', 'after', 'cancel'])) return 'js'
          return 'none'
        })(),
        appearType = (() => {
          if (appear === true) return 'enter'
          if ('from' in appear) return 'css'
          if (some<keyof TransitionJs<B>>(key => key in appear)(['before', 'active', 'after', 'cancel'])) return 'js'
          return 'none'
        })()

  return {
    appear: appearType,
    enter: enterType,
    leave: leaveType,
  }
}
