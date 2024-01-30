export function getOptions () {
  return JSON.parse(new URLSearchParams(window.location.search).get('options') || '{}')
}
