import { v2CodeToNumber } from './codes'

test('v2 codes convert to numbers correctly', () => {
  expect(v2CodeToNumber('AAAAAA')).toBe(-1679540573)
  expect(v2CodeToNumber('ABCDEF')).toBe(-1943683525)
  expect(v2CodeToNumber('UVWXYZ')).toBe(-1838004714)
  expect(v2CodeToNumber('EIVKQQ')).toBe(-2147036604)
})