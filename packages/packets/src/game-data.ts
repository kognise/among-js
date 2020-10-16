import { GameData, PlayerColor, TaskInfo } from '@among-js/data'
import { pack, readPacked } from '@among-js/util'
import ByteBuffer from 'bytebuffer'
import { TaskType } from 'packages/data/dist'

/**
 * Read a game data object from a buffer.
 * 
 * @param buffer Buffer to read from
 */
export const readGameData = (buffer: ByteBuffer): GameData => {
  buffer.readInt16()
  const playerId = buffer.readByte()

  const playerNameLength = buffer.readByte()
  const playerName = buffer.readString(playerNameLength)

  const color: PlayerColor = buffer.readByte()
  const hat = readPacked(buffer)
  const pet = readPacked(buffer)
  const skin = readPacked(buffer)

  const flags = buffer.readByte()
  const disconnected = (flags & 1) > 0
  const isImpostor = (flags & 2) > 0
  const isDead = (flags & 4) > 0

  const taskCount = buffer.readByte()
  const tasks: TaskInfo[] = []

  for (let i = 0; i < taskCount; i++) {
    const type: TaskType = readPacked(buffer)
    const complete = buffer.readByte() === 1
    tasks.push({ type, complete })
  }

  return {
    playerId,
    playerName,
    color,
    hat,
    pet,
    skin,
    disconnected,
    isImpostor,
    isDead,
    tasks
  }
}

/**
 * Serialize a game data object into a buffer.
 * 
 * @remarks
 * The buffer is variable-size, meaning you should not rely on `buffer.capacity()`
 * to get the length. Instead, use `buffer.offset`.
 * 
 * @param gameData Game data
 */
export const serializeGameData = (gameData: GameData): ByteBuffer => {
  const buffer = new ByteBuffer(undefined, true)

  const packedHat = pack(gameData.hat)
  const packedPet = pack(gameData.pet)
  const packedSkin = pack(gameData.pet)

  buffer.writeInt16(
    2 +
      gameData.playerName.length +
      1 +
      packedHat.length +
      packedPet.length +
      packedSkin.length +
      2
  )
  buffer.writeByte(gameData.playerId)

  buffer.writeByte(gameData.playerName.length)
  buffer.writeString(gameData.playerName)

  buffer.writeByte(gameData.color)
  buffer.append(packedHat)
  buffer.append(packedPet)
  buffer.append(packedSkin)

  // TODO: Refactor to bitfield util coolness
  const f1 = gameData.disconnected ? 1 : 0
  const f2 = gameData.isImpostor ? 2 : 0
  const f3 = gameData.isDead ? 4 : 0
  buffer.writeByte(f1 | f2 | f3)

  // TODO: Write tasks
  buffer.writeByte(0)

  return buffer
}
