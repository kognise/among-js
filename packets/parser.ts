import consola from 'consola'
import { readPacked } from '../util/manipulation'
import { Vector2 } from '../util/vector'
import { GameDataType, PayloadType, prettyDisconnectReason, prettyGameDataType, prettyPayloadType, RPCFlag } from './enum'
import { GameDataPacket, GameComponent, GameDataPayloadPacket, PayloadPacket, RPCGameDataPacket, SpawnGameDataPacket, DataGameDataPacket } from './types'

const parseRPCGameDataPacket = (buffer: ByteBuffer, dataLength: number): RPCGameDataPacket => {
  // const netId = buffer.readByte()
  const flag: RPCFlag = buffer.readByte()
  const data = buffer.readBytes(dataLength - 1)
  return {
    type: GameDataType.RPC,
    netId: 0,
    flag,
    data
  }
}

const parseSpawnGameDataPacket = (buffer: ByteBuffer): SpawnGameDataPacket => {
  const spawnId = readPacked(buffer)
  const ownerId = readPacked(buffer)
  const flags = buffer.readByte()

  const componentCount = readPacked(buffer)
  const components: GameComponent[] = []

  for (let i = 0; i < componentCount; i++) {
    const netId = buffer.readByte()
    const length = buffer.readUint16()
    buffer.readByte()
    const data = buffer.readBytes(length)

    consola.info(`Net id: ${netId}, size: ${length}`)
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

const parseDataGameDataPacket = (buffer: ByteBuffer): DataGameDataPacket => {
  const netId = buffer.readByte()
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

const parseGameDataPayloadPacket = (buffer: ByteBuffer): GameDataPayloadPacket => {
  const codeNumber = buffer.readInt32()
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
        parts.push(parseDataGameDataPacket(buffer))
        break
      }
    }
    const endOffset = buffer.offset

    if (endOffset - startOffset < dataLength) {
      if (endOffset - startOffset === 0) {
        consola.warn(`Game data packet of type ${prettyGameDataType(dataType)} wasn't handled`)
      } else {
        consola.warn(`Parsing game data packet of type ${prettyGameDataType(dataType)} did not use entire length (${endOffset - startOffset} < ${dataLength})`)
      }
      buffer.skip(dataLength - (endOffset - startOffset))
    }
  }

  return {
    type: PayloadType.GameData,
    code: codeNumber,
    parts
  }
}

export const parsePayloads = (buffer: ByteBuffer): PayloadPacket[] => {
  const packets: PayloadPacket[] = []

  while (buffer.offset < buffer.capacity()) {
    const payloadLength = buffer.readInt16()
    const payloadType: PayloadType = buffer.readByte()

    const startOffset = buffer.offset
    switch (payloadType) {
      case PayloadType.GameData: {
        packets.push(parseGameDataPayloadPacket(buffer))
        break
      }

      case PayloadType.JoinedGame: {
        const codeNumber = buffer.readInt32()
        const playerId = buffer.readUint32()
        const hostId = buffer.readUint32()
        buffer.skip(payloadLength - (buffer.offset - startOffset))

        packets.push({
          type: payloadType,
          code: codeNumber,
          playerId,
          hostId
        })

        break
      }

      case PayloadType.Redirect: {
        const ip = `${buffer.readUint8()}.${buffer.readUint8()}.${buffer.readUint8()}.${buffer.readUint8()}`
        const port = buffer.readInt16()

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
    }
    const endOffset = buffer.offset

    if (endOffset - startOffset < payloadLength) {
      if (endOffset - startOffset === 0) {
        consola.warn(`Payload of type ${prettyPayloadType(payloadType)} wasn't handled`)
      } else {
        consola.warn(`Parsing payload of type ${prettyPayloadType(payloadType)} did not use entire length (${endOffset - startOffset} < ${payloadLength})`)
      }
      buffer.skip(payloadLength - (endOffset - startOffset))
    }
  }

  return packets
}