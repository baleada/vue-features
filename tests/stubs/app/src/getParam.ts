import type { Ability } from '../../../../src/extracted/ability'

export function getOptions () {
  return JSON.parse(new URLSearchParams(window.location.search).get('options') || '{}')
}

export function getDisabled () {
  return JSON.parse(new URLSearchParams(window.location.search).get('disabled') || '[]')
}

export function getRootAbility () {
  return (new URLSearchParams(window.location.search).get('rootAbility') || 'enabled') as Ability
}
