import ByteBuffer from 'bytebuffer'
import { Vector2 } from './vector'

test('can create vector2', () => {
  const vector2 = new Vector2(1, -3)
  expect(vector2.x).toBe(1)
  expect(vector2.y).toBe(-3)
})

test('can read vector2', () => {
  const buffer = new ByteBuffer(4)
  buffer.append(Buffer.from([0xbf, 0xff, 0x20, 0x00]))
  buffer.clear()

  const vector2 = Vector2.read(buffer)
  expect(buffer.offset).toBe(4)
  expect(Math.round(vector2.x)).toBe(20)
  expect(Math.round(vector2.y)).toBe(-30)
})

test('can write vector2', () => {
  const vector2 = new Vector2(20, -30)
  const buffer = new ByteBuffer(4)

  vector2.write(buffer)
  expect(buffer.offset).toBe(4)
  expect(buffer.buffer[0]).toBe(0xbf)
  expect(buffer.buffer[1]).toBe(0xff)
  expect(buffer.buffer[2]).toBe(0x20)
  expect(buffer.buffer[3]).toBe(0x00)
})
