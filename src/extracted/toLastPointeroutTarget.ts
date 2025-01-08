export function toLastPointeroutTarget (sequence) {
  let lastPointerout: PointerEvent | undefined,
      index = sequence.length - 1

  while (index >= 0) {
    const event = sequence[index]

    if (event.type === 'pointerout') {
      lastPointerout = event
      break
    }

    index--
  }

  return lastPointerout?.target
}
