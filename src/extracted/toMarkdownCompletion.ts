import {
  pipe,
  reverse,
  join,
} from 'lazy-collections'
import { createClip } from '@baleada/logic'

export type SymmetricalInlinePunctuation = '**' | '_' | '^' | '~' | '~~' | '`'

export function toSymmetricalCompletion ({ punctuation, segment }: { punctuation: SymmetricalInlinePunctuation, segment: string }) {
  return segment.startsWith(punctuation) && segment.endsWith(punctuation)
    ? segment.slice(punctuation.length, segment.length - punctuation.length)
    : `${punctuation}${segment}${punctuation}`
}

export type MappedBlockPunctuation =  '> ' | ((index: number) => string) | '- ' | '* ' | '- [] '

export function toMappedCompletion ({ punctuation, segment }: { punctuation: MappedBlockPunctuation, segment: string }) {
  const lines = segment.split('\n'),
        isCompleted = lines.every((line, index) => {
          if (typeof punctuation === 'function') {
            return line.startsWith(punctuation(index))
          }

          return line.startsWith(punctuation)
        })

  if (isCompleted) {
    return lines
      .map((line, index) => {
        if (typeof punctuation === 'function') {
          return line.slice(punctuation(index).length)
        }

        return line.slice(punctuation.length)
      })
      .join('\n')
  }

  return lines
    .map((line, index) => {
      if (typeof punctuation === 'function') {
        return `${punctuation(index)}${line}`
      }

      return `${punctuation}${line}`
    })
    .join('\n')
}

export type MirroredBlockPunctuation = '```\n'

export function toMirroredCompletion ({ punctuation, segment }: { punctuation: MirroredBlockPunctuation, segment: string }) {
  const mirrored = pipe(
    reverse(),
    join(''),
  )(punctuation.split(''))

  return segment.startsWith(punctuation) && segment.endsWith(mirrored)
    ? segment.slice(punctuation.length, segment.length - mirrored.length)
    : `${punctuation}${segment}${mirrored}`
}

export function toHeadingCompletion ({ level, segment }: { level: 1 | 2 | 3 | 4 | 5 | 6, segment: string }) {
  const hashes = (() => {
    let hashes = ''

    for (let i = 0; i < level; i++) {
      hashes += '#'
    }

    return hashes
  })()
  
  return segment.startsWith(`${hashes} `)
    ? segment.slice(`${hashes} `.length)
    : `${hashes} ${toWithoutHeading(segment)}`
}

const toWithoutHeading = createClip(/^#+\s+/)

export function toHorizontalRuleCompletion ({ character, segment }: { character: '-' | '*' | '_', segment: string }) {
  return `${segment}${segment.length > 0 ? '\n' : ''}${character}${character}${character}\n`
}
