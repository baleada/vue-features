export type SymmetricalInlinePunctuation = '**' | '_' | '^' | '~' | '~~' | '`'

export function toSymmetricalCompletion ({ punctuation, segment }: { punctuation: SymmetricalInlinePunctuation, segment: string }) {
  return segment.startsWith(punctuation) && segment.endsWith(punctuation)
    ? segment.slice(punctuation.length, segment.length - punctuation.length)
    : `${punctuation}${segment}${punctuation}`
}

export type MappedBlockPunctuation =  '> ' | ((index: number) => string) | '- ' | '* '

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

export type OpeningBlockPunctuation = '```\n'
export type ClosingBlockPunctuation = '\n```'

export function toOpeningAndClosingCompletion ({ opening, closing, segment }: { opening: OpeningBlockPunctuation, closing: ClosingBlockPunctuation, segment: string }) {
  return segment.startsWith(opening) && segment.endsWith(closing)
    ? segment.slice(opening.length, segment.length - closing.length)
    : `${opening}${segment}${closing}`
}
