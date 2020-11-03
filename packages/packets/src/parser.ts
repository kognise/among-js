import {
  RPCGameDataPacket,
  RPCFlag,
  GameDataType,
  SpawnGameDataPacket,
  GameComponent,
  DataGameDataPacket,
  GameDataPayloadPacket,
  GameDataPacket,
  prettyGameDataType,
  PayloadType,
  PayloadPacket,
  prettyDisconnectReason,
  prettyPayloadType,
  prettyRPCFlag,
  GameData,
  VoteState
} from '@among-js/data'
import { readPacked, Vector2 } from '@among-js/util'
import { readGameData } from './game-data'
import { readGameOptions } from './game-options'

const parseRPCGameDataPacket = (
  buffer: ByteBuffer,
  dataLength: number
): RPCGameDataPacket => {
  const beforeReadPacked = buffer.offset
  const netId = readPacked(buffer)
  const afterReadPacked = buffer.offset
  const packedSize = afterReadPacked - beforeReadPacked

  const flag: RPCFlag = buffer.readByte()

  switch (flag) {
    case RPCFlag.SyncSettings: {
      return {
        type: GameDataType.RPC,
        netId,
        flag,
        gameOptions: readGameOptions(buffer)
      }
    }

    case RPCFlag.CheckName:
    case RPCFlag.SetName: {
      const length = buffer.readByte()
      const name = buffer.readString(length)
      // @ts-ignore
      return {
        type: GameDataType.RPC,
        netId,
        flag,
        name
      }
    }

    case RPCFlag.CheckColor:
    case RPCFlag.SetColor: {
      return {
        type: GameDataType.RPC,
        netId,
        flag,
        color: buffer.readByte()
      }
    }

    case RPCFlag.UpdateGameData: {
      const players: GameData[] = []
      while (buffer.offset < beforeReadPacked + dataLength) {
        players.push(readGameData(buffer))
      }

      return {
        type: GameDataType.RPC,
        netId,
        flag,
        players
      }
    }

    case RPCFlag.VotingComplete: {
      const states: VoteState[] = []
      const statesLength = buffer.readByte()

      for (let playerId = 0; playerId < statesLength; playerId++) {
        const byte = buffer.readUint8()
        states.push({
          playerId,
          votedFor:
            (byte & 64) > 0 // Did vote
              ? (byte & 15) - 1
              : null,
          isDead: (byte & 128) > 0,
          didReport: (byte & 32) > 0
        })
      }

      const exiled = buffer.readUint8()
      const tie = buffer.readByte() > 0

      return {
        type: GameDataType.RPC,
        states,
        flag,
        exiled: exiled === 0xff ? null : exiled,
        tie
      }
    }

    case RPCFlag.MurderPlayer: {
      return {
        type: GameDataType.RPC,
        flag,
        id: readPacked(buffer)
      }
    }

    case RPCFlag.SetInfected: {
      const infectedLength = readPacked(buffer)
      const infected = []
      for (let i = 0; i < infectedLength; i++) {
        infected.push(buffer.readByte())
      }

      return {
        type: GameDataType.RPC,
        flag,
        infected
      }
    }

    default: {
      if (process.env.AJ_DEBUG === 'yes')
        console.warn(`RPC packet of type ${prettyRPCFlag(flag)} wasn't parsed`)

      const data = buffer.readBytes(dataLength - (1 + packedSize))
      return {
        type: GameDataType.RPC,
        netId,
        flag,
        data
      }
    }
  }
}

const parseSpawnGameDataPacket = (buffer: ByteBuffer): SpawnGameDataPacket => {
  const spawnId = readPacked(buffer)
  const ownerId = readPacked(buffer)
  const flags = buffer.readByte()

  const componentCount = readPacked(buffer)
  const components: GameComponent[] = []

  for (let i = 0; i < componentCount; i++) {
    const netId = readPacked(buffer)
    const length = buffer.readUint16()
    buffer.readByte()
    const data = buffer.readBytes(length)

    components.push({ netId, data })
  }

  return {
    type: GameDataType.Spawn,
    spawnId,
    ownerId,
    flags,
    components
  }
}

const parseDataGameDataPacket = (
  buffer: ByteBuffer,
  netId: number
): DataGameDataPacket => {
  const sequence = buffer.readUint16()
  const position = Vector2.read(buffer)
  const velocity = Vector2.read(buffer)

  return {
    type: GameDataType.Data,
    netId,
    sequence,
    position,
    velocity
  }
}

const genericParseGameDataPayloadPacket = (
  buffer: ByteBuffer,
  codeNumber: number
): GameDataPayloadPacket => {
  const parts: GameDataPacket[] = []

  while (buffer.offset < buffer.capacity()) {
    const dataLength = buffer.readInt16()
    const dataType: GameDataType = buffer.readByte()

    const startOffset = buffer.offset
    switch (dataType) {
      case GameDataType.RPC: {
        parts.push(parseRPCGameDataPacket(buffer, dataLength))
        break
      }

      case GameDataType.Spawn: {
        parts.push(parseSpawnGameDataPacket(buffer))
        break
      }

      case GameDataType.Data: {
        const beforeNetId = buffer.offset
        const netId = readPacked(buffer)
        const afterNetId = buffer.offset
        if (dataLength === afterNetId - beforeNetId + 10) {
          parts.push(parseDataGameDataPacket(buffer, netId))
        } else {
          buffer.readBytes(dataLength - (afterNetId - beforeNetId))
        }

        break
      }
    }
    const endOffset = buffer.offset

    if (endOffset - startOffset < dataLength) {
      if (endOffset - startOffset === 0) {
        if (process.env.AJ_DEBUG === 'yes')
          console.warn(
            `Game data packet of type ${prettyGameDataType(
              dataType
            )} wasn't handled`
          )
      } else {
        console.warn(
          `Parsing game data packet of type ${prettyGameDataType(
            dataType
          )} did not use entire length (${endOffset -
            startOffset} < ${dataLength})`
        )
      }
      buffer.skip(dataLength - (endOffset - startOffset))
    } else if (endOffset - startOffset > dataLength) {
      throw new Error(
        `Parsing game data packet of type ${prettyGameDataType(
          dataType
        )} went over the length`
      )
    }
  }

  return {
    type: PayloadType.GameData,
    code: codeNumber,
    parts
  }
}

/**
 * Take a buffer of bytes and parse it into a rich object structure for
 * consuming for code. See the `@among-us/data` docs for all packet types.
 *
 * @param packets Packets to serialize
 */
export const parsePayloads = (buffer: ByteBuffer): PayloadPacket[] => {
  const packets: PayloadPacket[] = []

  while (buffer.offset < buffer.capacity()) {
    const payloadLength = buffer.readInt16()
    const payloadType: PayloadType = buffer.readByte()

    const startOffset = buffer.offset
    switch (payloadType) {
      case PayloadType.GameData: {
        const codeNumber = buffer.readInt32()
        packets.push(genericParseGameDataPayloadPacket(buffer, codeNumber))
        break
      }

      case PayloadType.GameDataTo: {
        const codeNumber = buffer.readInt32()
        const recipient = readPacked(buffer)
        packets.push({
          ...genericParseGameDataPayloadPacket(buffer, codeNumber),
          type: PayloadType.GameDataTo,
          recipient
        })
        break
      }

      case PayloadType.JoinedGame: {
        const codeNumber = buffer.readInt32()
        const playerClientId = buffer.readUint32()
        const hostClientId = buffer.readUint32()
        buffer.skip(payloadLength - (buffer.offset - startOffset))

        packets.push({
          type: payloadType,
          code: codeNumber,
          playerClientId,
          hostClientId
        })

        break
      }

      case PayloadType.Redirect: {
        const ip = `${buffer.readUint8()}.${buffer.readUint8()}.${buffer.readUint8()}.${buffer.readUint8()}`
        const port = buffer.readUint16()

        packets.push({
          type: payloadType,
          ip,
          port
        })

        break
      }

      case PayloadType.JoinGame: {
        const reason = new Error(prettyDisconnectReason(buffer.readByte()))
        buffer.skip(payloadLength - (buffer.offset - startOffset))
        packets.push({
          type: payloadType,
          reason
        })

        break
      }

      case PayloadType.EndGame: {
        const code = buffer.readInt32()
        const endReason = buffer.readByte()
        const showAd = buffer.readByte() > 0

        packets.push({
          type: payloadType,
          code,
          endReason,
          showAd
        })

        break
      }

      case PayloadType.StartGame: {
        const code = buffer.readInt32()
        packets.push({
          type: payloadType,
          code
        })

        break
      }
    }
    const endOffset = buffer.offset

    if (endOffset - startOffset < payloadLength) {
      if (endOffset - startOffset === 0) {
        if (process.env.AJ_DEBUG === 'yes')
          console.warn(
            `Payload of type ${prettyPayloadType(payloadType)} wasn't handled`
          )
      } else {
        console.warn(
          `Parsing payload of type ${prettyPayloadType(
            payloadType
          )} did not use entire length (${endOffset -
            startOffset} < ${payloadLength})`
        )
      }
      buffer.skip(payloadLength - (endOffset - startOffset))
    } else if (endOffset - startOffset > payloadLength) {
      throw new Error(
        `Parsing payload packet of type ${prettyPayloadType(
          payloadType
        )} went over the length`
      )
    }
  }

  return packets
}
