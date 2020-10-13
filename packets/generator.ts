import consola from 'consola'
import { GameDataType, PayloadType, prettyGameDataType, prettyPayloadType } from './enum'
import { GameDataPayloadPacket, PayloadPacket, DataGameDataPacket, GameDataToPayloadPacket, GameDataPacket, RPCGameDataPacket, SpawnGameDataPacket, SceneChangeGameDataPacket } from './types'
import ByteBuffer from 'bytebuffer'
import { assertJoinGameRequestPayloadPacket } from './assertions'
import { pack } from '../util/manipulation'

const generateDataGameDataPacket = (packet: DataGameDataPacket): ByteBuffer => {
  const buffer = new ByteBuffer(14, true)
  buffer.writeInt16(11)
  buffer.writeByte(packet.type)

  buffer.writeByte(packet.netId)
  buffer.writeUint16(packet.sequence)
  packet.position.write(buffer)
  packet.velocity.write(buffer)

  return buffer
}

const generateSceneChangeGameDataPacket = (packet: SceneChangeGameDataPacket): ByteBuffer => {
  const packedPlayerId = pack(packet.playerId)
  const size = packedPlayerId.length + 1 + packet.setting.length
  
  const buffer = new ByteBuffer(3 + size, true)
  buffer.writeInt16(size)
  buffer.writeByte(packet.type)

  buffer.append(packedPlayerId)
  buffer.writeByte(packet.setting.length)
  buffer.writeString(packet.setting)

  return buffer
}

const generateRPCGameDataPacket = (packet: RPCGameDataPacket): ByteBuffer => {
  const buffer = new ByteBuffer(5 + packet.data.capacity(), true)
  buffer.writeInt16(11)
  buffer.writeByte(packet.type)

  buffer.writeByte(packet.netId)
  buffer.writeByte(packet.flag)
  buffer.append(packet.data.buffer)

  return buffer
}

const genericGameDataPacketSwitch = (part: GameDataPacket): ByteBuffer => {
  switch (part.type) {
    case GameDataType.Data: {
      return generateDataGameDataPacket(part)
    }

    case GameDataType.RPC: {
      return generateRPCGameDataPacket(part)
    }

    case GameDataType.SceneChange: {
      return generateSceneChangeGameDataPacket(part)
    }

    default: {
      consola.warn(`Game data packet of type ${prettyGameDataType(part.type)} wasn't able to be generated`)
      return new ByteBuffer(0)
    }
  }
}

const generateGameDataPayloadPacket = (packet: GameDataPayloadPacket): ByteBuffer => {
  const serializedParts: ByteBuffer[] = []

  for (const part of packet.parts) {
    serializedParts.push(genericGameDataPacketSwitch(part))
  }

  const size = serializedParts.reduce((acc, bb) => acc + bb.capacity(), 0)
  const buffer = new ByteBuffer(7 + size, true)

  buffer.writeInt16(4 + size)
  buffer.writeByte(packet.type)
  buffer.writeInt32(packet.code)

  for (const bb of serializedParts) {
    buffer.append(bb.buffer)
  }
  return buffer
}

const generateGameDataToPayloadPacket = (packet: GameDataToPayloadPacket): ByteBuffer => {
  const serializedParts: ByteBuffer[] = []

  for (const part of packet.parts) {
    serializedParts.push(genericGameDataPacketSwitch(part))
  }

  const packedRecipient = pack(packet.recipient)
  const size = serializedParts.reduce((acc, bb) => acc + bb.capacity(), 0)
  const buffer = new ByteBuffer(7 + packedRecipient.length + size, true)

  buffer.writeInt16(4 + packedRecipient.length + size)
  buffer.writeByte(packet.type)
  buffer.writeInt32(packet.code)
  buffer.append(packedRecipient)

  for (const bb of serializedParts) {
    buffer.append(bb.buffer)
  }
  return buffer
}

export const generatePayloads = (packets: PayloadPacket[]): ByteBuffer => {
  const serializedPackets: ByteBuffer[] = []

  for (const packet of packets) {
    switch (packet.type) {
      case PayloadType.GameData: {
        serializedPackets.push(generateGameDataPayloadPacket(packet))
        break
      }

      case PayloadType.GameDataTo: {
        serializedPackets.push(generateGameDataToPayloadPacket(packet))
        break
      }

      case PayloadType.JoinGame: {
        assertJoinGameRequestPayloadPacket(packet)
        
        const bb = new ByteBuffer(8, true)
        bb.writeInt16(5)
        bb.writeByte(packet.type)
        bb.writeInt32(packet.code)
        bb.writeByte(7)
        serializedPackets.push(bb)

        break
      }

      default: {
        consola.warn(`Packet of type ${prettyPayloadType(packet.type)} wasn't able to be generated`)
      }
    }
  }

  const buffer = new ByteBuffer(serializedPackets.reduce((acc, bb) => acc + bb.capacity(), 0), true)
  for (const bb of serializedPackets) {
    buffer.append(bb.buffer)
  }
  return buffer
}