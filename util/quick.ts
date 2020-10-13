import ByteBuffer from 'bytebuffer'

export const quick = (size: number, cb: (bb: ByteBuffer) => void): ByteBuffer => {
  const bb = new ByteBuffer(size, true)
  cb(bb)
  return bb
}