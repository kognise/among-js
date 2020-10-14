const { AmongUsSocket } = require('@among-js/sus')
const { PlayerColor } = require('@among-js/data')
const consola = require('consola')

consola.wrapAll()

const code = 'ABCDEF'
const username = 'test player'
const color = PlayerColor.Orange

const s = new AmongUsSocket(username)

;(async () => {
  await s.connect(1337, '127.0.0.1')
  consola.info(`Connected to server as ${username}`)

  const joined = await s.joinGame(code)
  consola.success(`Joined game ${code}`)
  consola.info(`Player id: ${joined.playerId}, host id: ${joined.hostId}`)

  // Spawn the player with an username + avatar.
  await s.spawn(color)
  consola.success('Spawned player')
})().catch(console.error)

process.on('SIGINT', () => {
  // Clean up the socket cleanly to avoid reconnection issues.
  consola.info('Closing sockets')
  s.s.disconnect()
  process.exit()
})
