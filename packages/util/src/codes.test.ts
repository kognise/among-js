import { v2CodeToNumber, v2NumberToCode } from './codes'

test('v2 codes convert to numbers correctly', () => {
  expect(v2CodeToNumber('AAAAAA')).toBe(-1679540573)
  expect(v2CodeToNumber('ABCDEF')).toBe(-1943683525)
  expect(v2CodeToNumber('UVWXYZ')).toBe(-1838004714)
  expect(v2CodeToNumber('EIVKQQ')).toBe(-2147036604)
})

test('v2 numbers convert to codes correctly', () => {
  expect(v2NumberToCode(-1679540573)).toBe('AAAAAA')
  expect(v2NumberToCode(-1943683525)).toBe('ABCDEF')
  expect(v2NumberToCode(-1838004714)).toBe('UVWXYZ')
  expect(v2NumberToCode(-2147036604)).toBe('EIVKQQ')
})
