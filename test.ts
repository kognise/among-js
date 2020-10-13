import consola from 'consola'
import { AmongUsSocket } from './networking/among-us'
import { PlayerColor } from './packets/enum'

const code = 'AHNCJF'
const username = 'fakenise'
const color = PlayerColor.Orange

const s = new AmongUsSocket(username)

;(async () => {
  await s.connect(22023, '139.162.111.196')
  consola.success(`Connected to remote server as ${username}`)

  const joined = await s.joinGame(code)
  consola.success(`Joined game ${code}`)
  consola.info(`Player id: ${joined.playerId}, host id: ${joined.hostId}`)

  // Spawn the player with an username + avatar
  await s.spawn(color)
  consola.success('Spawned player')
})().catch(consola.error)

process.on('SIGINT', () => {
  consola.info('Closing sockets')
  s.s.disconnect()
  process.exit()
})