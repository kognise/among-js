// https://wiki.weewoo.net/wiki/Game_Codes

const v2Characters = 'QWXRTYLPESDFGHUJKZOCVBINMA'
const v2LookupTable = [
  25, 21, 19, 10, 8, 11, 12, 13, 22, 15, 16, 6, 24, 23, 18, 7, 0, 3, 9, 4, 14, 20, 1, 2, 5, 17
]

/**
 * Converts a V2 game code into its number form.
 * 
 * @param code Game code as a string
 */
export const v2CodeToNumber = (code: string) => {
  code = code.toUpperCase()

  const a = v2LookupTable[code[0].charCodeAt(0) - 65]
  const b = v2LookupTable[code[1].charCodeAt(0) - 65]
  const c = v2LookupTable[code[2].charCodeAt(0) - 65]
  const d = v2LookupTable[code[3].charCodeAt(0) - 65]
  const e = v2LookupTable[code[4].charCodeAt(0) - 65]
  const f = v2LookupTable[code[5].charCodeAt(0) - 65]

  const one = (a + 26 * b) & 0x3ff
  const two = c + 26 * (d + 26 * (e + 26 * f))
  return one | ((two << 10) & 0x3ffffc00) | 0x80000000
}

/**
 * Converts a V2 game code as a number into a human-readable string
 * 
 * @param code Game code as a number
 */
export const v2NumberToCode = (code: number) => {
  const a = code & 0x3ff
  const b = (code >> 10) & 0xfffff

  return [
    v2Characters[a % 26],
    v2Characters[Math.trunc(a / 26)],
    v2Characters[b % 26],
    v2Characters[Math.trunc(b / 26 % 26)],
    v2Characters[Math.trunc(b / (26 * 26) % 26)],
    v2Characters[Math.trunc(b / (26 * 26 * 26) % 26)]
  ].join('')
}
