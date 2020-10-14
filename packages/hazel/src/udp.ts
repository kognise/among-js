import dgram from 'dgram'
import ByteBuffer from 'bytebuffer'
import { EventEmitter } from 'events'
import { PacketType, prettyDisconnectReason } from '@among-js/data'

export declare interface HazelUDPSocket {
  on(event: 'message', cb: (buffer: ByteBuffer) => void): this
}

// Implementation of the Hazel base protocol.
export class HazelUDPSocket extends EventEmitter {
  private s: dgram.Socket
  private reliableId: number = 0

  constructor(type: dgram.SocketType) {
    super()

    this.s = dgram.createSocket(type)

    this.s.on('error', err => {
      console.error(err)
      this.s.close()
    })

    // Setup listeners for various packet types.
    this.s.on('message', msg => {
      const packetType: PacketType = msg[0]

      switch (packetType) {
        case PacketType.Acknowledgement: {
          // TODO: Actually check acknowledgement packets for reliability.
          break
        }

        case PacketType.Ping: {
          this.handleReliableResponse(msg)
          break
        }

        case PacketType.Disconnect: {
          console.warn(
            `Disconnecting by request:\n${prettyDisconnectReason(msg[1])}`
          )
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
          console.warn(`Unknown packet type: ${packetType}`)
        }
      }
    })
  }

  private handleReliableResponse(buffer: Buffer) {
    // Reliable packets require an acknowledgement packet in response
    // or the server will throw a tantrum.
    // https://wiki.weewoo.net/wiki/Protocol#Acknowledgement

    const reliableId = (buffer[1] << 8) + buffer[2]
    const bb = new ByteBuffer(4)
    bb.writeByte(PacketType.Acknowledgement)
    bb.writeInt16(reliableId)
    bb.writeByte(0xff)
    this.send(bb)
  }

  private handlePayloadPacket(buffer: Buffer, offset: number) {
    // Generic handler for packets with payloads, for both reliable
    // and normal packets.

    const bb = new ByteBuffer(buffer.length - offset, true)
    bb.append(buffer.slice(offset))
    bb.clear()
    this.emit('message', bb)
  }

  private async waitForAcknowledgement(reliableId: number) {
    // Hacky helper to wait for an acknowledgement before continuing.

    await new Promise(resolve => {
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
    // Bind the socket to an ip and port.
    return new Promise(resolve => {
      this.s.connect(port, ip, () => resolve())
    })
  }

  async sendReliable(sendOption: PacketType, data: ByteBuffer) {
    // Helper for sending reliable packer. Automatically handles waiting for
    // acknowledgements and incrementing the reliable id.
    // https://wiki.weewoo.net/wiki/Protocol#Reliable_Packets

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
    // Just a simple wrapper for asyncronously sending ByteBuffer packets.

    return new Promise((resolve, reject) => {
      this.s.send(bb.buffer, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  async disconnect() {
    // Disconnect cleanly by sending a disconnect packet and
    // waiting for a response. Otherwise the next time we try
    // to connect the server won't respond to the hello.
    // https://wiki.weewoo.net/wiki/Protocol#Disconnect

    const dc = new ByteBuffer(1)
    dc.writeByte(9)

    this.s.removeAllListeners()
    const promise = new Promise(resolve => {
      this.s.on('message', msg => {
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
