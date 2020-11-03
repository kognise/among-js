import {
  GameOptions,
  Language,
  AmongUsMap,
  TaskBarUpdates
} from '@among-js/data'
import { pack, readPacked } from '@among-js/util'
import ByteBuffer from 'bytebuffer'

const baseLength = 46
const packedBaseLength = pack(baseLength)

const supportedVersion = 4

/**
 * Read game options data from a buffer.
 *
 * @param buffer Buffer to read from
 */
export const readGameOptions = (buffer: ByteBuffer): GameOptions => {
  readPacked(buffer) // Length
  const version = buffer.readByte() // Version

  if (supportedVersion > version) {
    throw new Error(`Could not parse game data of old version ${version}`)
  }
  if (version !== supportedVersion) {
    // Often new game options formats are vaguely backwards-compatible
    console.warn(`Parsing game data of unsupported version ${version}`)
  }

  const maxPlayers = buffer.readByte()
  const language: Language = buffer.readUint32()
  const map: AmongUsMap = buffer.readByte()

  const playerSpeedModifier = buffer.readFloat32()
  const crewLightModifier = buffer.readFloat32()
  const impostorLightModifier = buffer.readFloat32()
  const killCooldown = buffer.readFloat32()

  const commonTasks = buffer.readByte()
  const longTasks = buffer.readByte()
  const shortTasks = buffer.readByte()

  const emergencies = buffer.readInt32()
  const impostors = buffer.readByte()
  const killDistance = buffer.readByte()
  const discussionTime = buffer.readInt32()
  const votingTime = buffer.readInt32()
  const isDefault = buffer.readByte() > 0

  const emergencyCooldown = buffer.readByte()
  const confirmEjects = buffer.readByte() > 0
  const visualTasks = buffer.readByte() > 0

  const anonymousVotes = buffer.readByte() > 0
  const taskBarUpdates: TaskBarUpdates = buffer.readByte()

  return {
    maxPlayers,
    language,
    map,
    playerSpeedModifier,
    crewLightModifier,
    impostorLightModifier,
    killCooldown,
    commonTasks,
    longTasks,
    shortTasks,
    emergencies,
    impostors,
    killDistance,
    discussionTime,
    votingTime,
    isDefault,
    emergencyCooldown,
    confirmEjects,
    visualTasks,
    anonymousVotes,
    taskBarUpdates
  }
}

/**
 * Serialize game options data into a buffer.
 *
 * @remarks
 * The buffer is variable-size, meaning you should not rely on `buffer.capacity()`
 * to get the length. Instead, use `buffer.offset`.
 *
 * @param gameOptions Game options data
 */
export const serializeGameOptions = (gameOptions: GameOptions): ByteBuffer => {
  const buffer = new ByteBuffer(undefined, true)

  buffer.append(packedBaseLength)
  buffer.writeByte(supportedVersion)

  buffer.writeByte(gameOptions.maxPlayers)
  buffer.readUint32(gameOptions.language)
  buffer.readByte(gameOptions.map)

  buffer.writeFloat32(gameOptions.playerSpeedModifier)
  buffer.writeFloat32(gameOptions.crewLightModifier)
  buffer.writeFloat32(gameOptions.impostorLightModifier)
  buffer.writeFloat32(gameOptions.killCooldown)

  buffer.writeByte(gameOptions.commonTasks)
  buffer.writeByte(gameOptions.longTasks)
  buffer.writeByte(gameOptions.shortTasks)

  buffer.writeInt32(gameOptions.emergencies)
  buffer.writeByte(gameOptions.impostors)
  buffer.writeByte(gameOptions.killDistance)
  buffer.writeInt32(gameOptions.discussionTime)
  buffer.writeInt32(gameOptions.votingTime)
  buffer.readByte(gameOptions.isDefault ? 1 : 0)

  buffer.writeByte(gameOptions.emergencyCooldown)
  buffer.writeByte(gameOptions.confirmEjects ? 1 : 0)
  buffer.writeByte(gameOptions.visualTasks ? 1 : 0)

  buffer.writeByte(gameOptions.anonymousVotes ? 1 : 0)
  buffer.writeByte(gameOptions.taskBarUpdates)

  return buffer
}
