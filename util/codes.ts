// https://wiki.weewoo.net/wiki/Game_Codes

const v2LookupTable: Record<number, number> = {
  [0]: 0x19,
  [1]: 0x15,
  [2]: 0x13,
  [3]: 0x0A,
  [4]: 0x08,
  [5]: 0x0B,
  [6]: 0x0C,
  [7]: 0x0D,
  [8]: 0x16,
  [9]: 0x0F,
  [10]: 0x10,
  [11]: 0x06,
  [12]: 0x18,
  [13]: 0x17,
  [14]: 0x12,
  [15]: 0x07,
  [16]: 0x00,
  [17]: 0x03,
  [18]: 0x09,
  [19]: 0x04,
  [20]: 0x0E,
  [21]: 0x14,
  [22]: 0x01,
  [23]: 0x02,
  [24]: 0x05,
  [25]: 0x11,
}

export const v2CodeToNumber = (code: string) => {
  const b1 = v2LookupTable[code.toUpperCase()[0].charCodeAt(0) - 65]
  const b2 = v2LookupTable[code.toUpperCase()[1].charCodeAt(0) - 65]
  const b3 = v2LookupTable[code.toUpperCase()[2].charCodeAt(0) - 65]
  const b4 = v2LookupTable[code.toUpperCase()[3].charCodeAt(0) - 65]
  const b5 = v2LookupTable[code.toUpperCase()[4].charCodeAt(0) - 65]
  const b6 = v2LookupTable[code.toUpperCase()[5].charCodeAt(0) - 65]

  const lsb = (b1 + 26 * b2) & 0x3FF
  const msb = (b3 + 26 * (b4 + 26 * (b5 + 26 * b6)))
  return lsb | ((msb << 10) & 0x3FFFFC00) | 0x80000000
}