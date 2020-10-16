import { lerp, unlerp } from './manipulation'

/**
 * A Unity Vector2 helper class with serialization and deserialization methods.
 */
export class Vector2 {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  /**
   * Read a Vector2 from a buffer and correctly linearly interpolate the values.
   * 
   * @param bb Buffer to read from
   */
  static read(bb: ByteBuffer): Vector2 {
    const x = bb.readUint16() / 65535
    const y = bb.readUint16() / 65535
    return new Vector2(lerp(-40, 40, x), lerp(-40, 40, y))
  }

  /**
   * Write the Vector2 to a buffer and correctly linearly interpolate the values.
   * 
   * @param bb Buffer to write to
   */
  write(bb: ByteBuffer) {
    const x = unlerp(-40, 40, this.x) * 65535
    const y = unlerp(-40, 40, this.y) * 65535
    bb.writeUint16(Math.round(x))
    bb.writeUint16(Math.round(y))
  }
}
