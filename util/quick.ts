import ByteBuffer from 'bytebuffer'

export const quick = (size: number, cb: (bb: ByteBuffer) => void): ByteBuffer => {
  // Just a function for making byte buffers inline. Nothing fancy.

  const bb = new ByteBuffer(size, true)
  cb(bb)
  return bb
}