import ByteBuffer from 'bytebuffer'
import {
  GameDataType,
  PayloadType,
  assertJoinGameRequestPayloadPacket,
  DataGameDataPacket,
  GameDataPacket,
  GameDataPayloadPacket,
  GameDataToPayloadPacket,
  PayloadPacket,
  RPCGameDataPacket,
  SceneChangeGameDataPacket,
  prettyGameDataType,
  prettyPayloadType,
  prettyRPCFlag,
  RPCFlag
} from '@among-js/data'
import { pack } from '@among-js/util'
import { serializeGameOptions } from './game-options'
import { serializeGameData } from './game-data'

const generateDataGameDataPacket = (packet: DataGameDataPacket): ByteBuffer => {
  const packedNetId = pack(packet.netId)

  const buffer = new ByteBuffer(3 + packedNetId.length + 10, true)
  buffer.writeInt16(packedNetId.length + 10)
  buffer.writeByte(packet.type)

  buffer.append(packedNetId)
  buffer.writeUint16(packet.sequence)
  packet.position.write(buffer)
  packet.velocity.write(buffer)

  return buffer
}

const generateSceneChangeGameDataPacket = (
  packet: SceneChangeGameDataPacket
): ByteBuffer => {
  const packedPlayerClientId = pack(packet.playerClientId)
  const size = packedPlayerClientId.length + 1 + packet.location.length

  const buffer = new ByteBuffer(3 + size, true)
  buffer.writeInt16(size)
  buffer.writeByte(packet.type)

  buffer.append(packedPlayerClientId)
  buffer.writeByte(packet.location.length)
  buffer.writeString(packet.location)

  return buffer
}

const generateRPCGameDataPacket = (packet: RPCGameDataPacket): ByteBuffer => {
  switch (packet.flag) {
    case RPCFlag.SyncSettings: {
      const packedNetId = pack(packet.netId)
      const serializedGameOptions = serializeGameOptions(packet.gameOptions)

      const buffer = new ByteBuffer(
        3 + packedNetId.length + 1 + serializedGameOptions.offset,
        true
      )

      buffer.writeInt16(packedNetId.length + 1 + serializedGameOptions.offset)
      buffer.writeByte(packet.type)

      buffer.append(packedNetId)
      buffer.writeByte(packet.flag)

      buffer.append(
        serializedGameOptions.buffer.slice(0, serializedGameOptions.offset)
      )
      return buffer
    }

    case RPCFlag.CheckName:
    case RPCFlag.SetName: {
      const packedNetId = pack(packet.netId)
      const buffer = new ByteBuffer(
        3 + packedNetId.length + 2 + packet.name.length,
        true
      )

      buffer.writeInt16(packedNetId.length + 2 + packet.name.length)
      buffer.writeByte(packet.type)

      buffer.append(packedNetId)
      buffer.writeByte(packet.flag)

      buffer.writeByte(packet.name.length)
      buffer.writeString(packet.name)

      return buffer
    }

    case RPCFlag.UpdateGameData: {
      const dataBuffer = new ByteBuffer(undefined, true)
      for (const player of packet.players) {
        const serialized = serializeGameData(player)
        dataBuffer.append(serialized.buffer.slice(0, serialized.offset))
      }

      const packedNetId = pack(packet.netId)
      const buffer = new ByteBuffer(
        3 + packedNetId.length + 1 + dataBuffer.offset,
        true
      )

      buffer.writeInt16(packedNetId.length + 1 + dataBuffer.offset)
      buffer.writeByte(packet.type)

      buffer.append(packedNetId)
      buffer.writeByte(packet.flag)
      buffer.append(dataBuffer.slice(0, dataBuffer.offset))

      return buffer
    }

    case RPCFlag.CheckColor:
    case RPCFlag.SetColor: {
      const packedNetId = pack(packet.netId)
      const buffer = new ByteBuffer(3 + packedNetId.length + 2, true)

      buffer.writeInt16(packedNetId.length + 2)
      buffer.writeByte(packet.type)

      buffer.append(packedNetId)
      buffer.writeByte(packet.flag)

      buffer.writeByte(packet.color)
      return buffer
    }

    case RPCFlag.VotingComplete: {
      const buffer = new ByteBuffer(3, true)

      buffer.writeByte(0)
      buffer.writeUint8(packet.exiled ?? 0xff)
      buffer.writeByte(buffer.readByte() ? 1 : 0)

      return buffer
    }

    case RPCFlag.SetInfected: {
      const packedInfectedLength = pack(packet.infected.length)
      const buffer = new ByteBuffer(
        packedInfectedLength.length + packet.infected.length,
        true
      )
      buffer.writeBytes(packedInfectedLength)
      for (const id of packet.infected) buffer.writeByte(id)
      return buffer
    }

    case RPCFlag.MurderPlayer: {
      const packedId = pack(packet.id)
      const buffer = new ByteBuffer(packedId.length, true)
      buffer.writeBytes(packedId)
      return buffer
    }

    case RPCFlag.SetStartCounter: {
      const packedSequence = pack(packet.sequence)
      const buffer = new ByteBuffer(packedSequence.length + 1, true)
      buffer.writeBytes(packedSequence)
      buffer.writeByte(packet.seconds)
      return buffer
    }

    default: {
      if (process.env.AJ_DEBUG === 'yes')
        console.warn(
          `Generated data-only packet of type ${prettyRPCFlag(packet.flag)}`
        )

      const packedNetId = pack(packet.netId)
      const buffer = new ByteBuffer(
        3 + packedNetId.length + 1 + packet.data.capacity(),
        true
      )
      buffer.writeInt16(11)
      buffer.writeByte(packet.type)

      buffer.append(packedNetId)
      buffer.writeByte(packet.flag)
      buffer.append(packet.data.buffer)

      return buffer
    }
  }
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

    case GameDataType.Ready: {
      const packedClientId = pack(part.clientId)
      const buffer = new ByteBuffer(3 + packedClientId.length, true)

      buffer.writeInt16(packedClientId.length)
      buffer.writeByte(part.type)
      buffer.append(packedClientId)
      
      return buffer
    }

    default: {
      if (process.env.AJ_DEBUG === 'yes')
        console.warn(
          `Game data packet of type ${prettyGameDataType(
            part.type
          )} wasn't able to be generated`
        )
      return new ByteBuffer(0)
    }
  }
}

const generateGameDataPayloadPacket = (
  packet: GameDataPayloadPacket
): ByteBuffer => {
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

const generateGameDataToPayloadPacket = (
  packet: GameDataToPayloadPacket
): ByteBuffer => {
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

/**
 * Take a list of typed object packets and serialize them into a byte
 * buffer to send over the network. This is the main function of this
 * library, see the `@among-us/data` docs for all packet types.
 *
 * @param packets Packets to serialize
 */
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

      case PayloadType.Redirect: {
        const bb = new ByteBuffer(9, true)

        bb.writeInt16(6)
        bb.writeByte(packet.type)

        const ipBytes = packet.ip.split('.').map(part => parseInt(part))
        bb.writeUint8(ipBytes[0])
        bb.writeUint8(ipBytes[1])
        bb.writeUint8(ipBytes[2])
        bb.writeUint8(ipBytes[3])

        bb.writeInt16(packet.port)
        serializedPackets.push(bb)

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
        if (process.env.AJ_DEBUG === 'yes')
          console.warn(
            `Packet of type ${prettyPayloadType(
              packet.type
            )} wasn't able to be generated`
          )
      }
    }
  }

  const buffer = new ByteBuffer(
    serializedPackets.reduce((acc, bb) => acc + bb.capacity(), 0),
    true
  )
  for (const bb of serializedPackets) {
    buffer.append(bb.buffer)
  }
  return buffer
}
