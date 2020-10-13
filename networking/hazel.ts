import dgram from 'dgram'
import ByteBuffer from 'bytebuffer'
import { PacketType, prettyDisconnectReason } from '../packets/enum'
import { EventEmitter } from 'events'
import consola from 'consola'

export declare interface HazelUdpSocket {
  on(event: 'message', cb: (buffer: ByteBuffer) => void): this
}

export class HazelUdpSocket extends EventEmitter {
  private s: dgram.Socket
  private reliableId: number = 0

  constructor(type: dgram.SocketType) {
    super()

    this.s = dgram.createSocket(type)

    this.s.on('error', (err) => {
      consola.error(err)
      this.s.close()
    })
    
    this.s.on('message', (msg) => {
      const packetType: PacketType = msg[0]

      switch (packetType) {
        case PacketType.Acknowledgement: {
          consola.debug(`(Acknowledgement)`)
          break
        }

        case PacketType.Ping: {
          this.handleReliableResponse(msg)
          break
        }

        case PacketType.Disconnect: {
          consola.info(`Disconnecting by request, ${prettyDisconnectReason(msg[1])}`)
          this.s.close()
          this.removeAllListeners()
          break
        }

        case PacketType.Normal: {
          this.handlePayloadPacket(msg, 1)
          break
        }

        case PacketType.Reliable: {
          this.handleReliableResponse(msg)
          this.handlePayloadPacket(msg, 3)
          break
        }

        default: {
          consola.warn(`Unknown packet type: ${packetType}`)
        }
      }
    })
  }

  private handleReliableResponse(buffer: Buffer) {
    const reliableId = (buffer[1] << 8) + buffer[2]
    const bb = new ByteBuffer(4)
    bb.writeByte(PacketType.Acknowledgement)
    bb.writeInt16(reliableId)
    bb.writeByte(0xff)
    this.send(bb)
  }

  private handlePayloadPacket(buffer: Buffer, offset: number) {
    const bb = new ByteBuffer(buffer.length - offset, true)
    bb.append(buffer.slice(offset))
    bb.clear()
    this.emit('message', bb)
  }

  private async waitForAcknowledgement(reliableId: number) {
    await new Promise((resolve) => {
      const cb = (msg: Buffer) => {
        const packetType: PacketType = msg[0]
        if (packetType !== PacketType.Acknowledgement) return

        const ackReliableId = (msg[1] << 8) + msg[2]
        if (ackReliableId !== reliableId) return

        this.s.off('message', cb)
        resolve()
      }

      this.s.on('message', cb)
    })
  }

  connect(port: number, ip?: string) {
    return new Promise((resolve) => {
      this.s.connect(port, ip, () => resolve())
    })
  }

  async sendReliable(sendOption: PacketType, data: ByteBuffer) {
    const reliableId = ++this.reliableId
    const bb = new ByteBuffer(3 + data.capacity())
    bb.writeByte(sendOption)
    bb.writeInt16(reliableId)
    bb.append(data.buffer)

    const ack = this.waitForAcknowledgement(reliableId)
    await this.send(bb)
    await ack
  }

  send(bb: ByteBuffer) {
    return new Promise((resolve, reject) => {
      this.s.send(bb.buffer, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  async disconnect() {
    const dc = new ByteBuffer(1)
    dc.writeByte(9)

    this.s.removeAllListeners()
    const promise = new Promise((resolve) => {
      this.s.on('message', (msg) => {
        if (msg[0] === PacketType.Disconnect) {
          this.s.close()
          this.s.removeAllListeners()
          this.removeAllListeners()
          resolve()
        }
      })
    })

    await this.send(dc)
    await promise
  }
}