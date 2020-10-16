import ByteBuffer from 'bytebuffer'
import { pack, lerp, unlerp, readPacked } from './manipulation'

test('lerp works', () => {
  expect(lerp(-10, 10, 0.5)).toBe(0)
})

test('lerp snaps', () => {
  expect(lerp(-30, -20, -69)).toBe(-30)
})

test('unlerp works', () => {
  expect(unlerp(-10, 10, 0)).toBe(0.5)
})

test('pack works', () => {
  expect(pack(0)).toMatchInlineSnapshot(`
    Object {
      "data": Array [
        0,
      ],
      "type": "Buffer",
    }
  `)

  expect(pack(782137612983)).toMatchInlineSnapshot(`
    Object {
      "data": Array [
        183,
        181,
        163,
        216,
        1,
      ],
      "type": "Buffer",
    }
  `)
})

test('can read packed numbers', () => {
  const bb = new ByteBuffer(1)
  bb.writeByte(0)
  expect(readPacked(bb)).toBe(0)
  expect(bb.offset).toBe(1)
})