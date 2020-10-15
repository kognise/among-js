import { GameOptions, Language, AmongUsMap } from '@among-js/data'
import { pack, readPacked } from '@among-js/util'

const baseLength = 44
const packedBaseLength = pack(baseLength)
export const gameOptionsLength = packedBaseLength.length + baseLength

export const readGameOptions = (buffer: ByteBuffer): GameOptions => {
  readPacked(buffer) // Length
  buffer.readByte() // Version

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
  const isDefault = buffer.readByte() === 1

  const emergencyCooldown = buffer.readByte()
  const confirmEjects = buffer.readByte() === 1
  const visualTasks = buffer.readByte() === 1

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
    visualTasks
  }
}

export const writeGameOptions = (
  gameOptions: GameOptions,
  buffer: ByteBuffer
) => {
  buffer.append(packedBaseLength)
  buffer.writeByte(3)

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
}
