export const pack = (value: number) => {
  const array = []
  
  do {
    let b = value & 0xFF
    if (value >= 0x80) {
      b |= 0x80
    }

    array.push(b)
    value >>= 7
  } while (value > 0)

  return Buffer.from(array)
}

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

export const lerp = (min: number, max: number, value: number) => {
  if (value < 0) {
    value = 0
  } else if (value > 1) {
    value = 1
  }

  return min + (max - min) * value
}

export const unlerp = (min: number, max: number, value: number) => {
  return (value - min) / (max - min)
}