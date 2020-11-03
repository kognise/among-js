/**
 * Pack a number into the smallest number of bytes possible.
 *
 * @remarks
 * See {@link https://wiki.weewoo.net/wiki/Packing | the wiki page on packing} for more information on this process.
 *
 * @param value Number to pack
 */
export const pack = (value: number) => {
  const array = []

  do {
    let b = value & 0xff
    if (value >= 0x80) {
      b |= 0x80
    }

    array.push(b)
    value >>= 7
  } while (value > 0)

  return Buffer.from(array)
}

/**
 * Read and return a packed number from a buffer, incrementing the offset by the number of bytes.
 *
 * @remarks
 * See {@link https://wiki.weewoo.net/wiki/Packing | the wiki page on packing} for more information on this process.
 *
 * @param bb Buffer to read from
 */
export const readPacked = (bb: ByteBuffer) => {
  let readMore = true
  let shift = 0
  let output = 0

  while (readMore) {
    let b = bb.readUint8()
    if (b >= 0x80) {
      readMore = true
      b ^= 0x80
    } else {
      readMore = false
    }

    output |= b << shift
    shift += 7
  }

  return output
}

/**
 * Linearly interpolate a number between 0 and 1 to be between the lower and upper bound.
 * See `unlerp` for the opposite of this.
 *
 * @param min Lower bound
 * @param max Upper bound
 * @param value Value to lerp
 */
export const lerp = (min: number, max: number, value: number) => {
  if (value < 0) {
    value = 0
  } else if (value > 1) {
    value = 1
  }

  return min + (max - min) * value
}

/**
 * Reverse of `lerp`. Takes a value between the lower and upper bound and maps it to a number between 0 and 1.
 *
 * @param min Lower bound
 * @param max Upper bound
 * @param value Value to unlerp
 */
export const unlerp = (min: number, max: number, value: number) => {
  return (value - min) / (max - min)
}
