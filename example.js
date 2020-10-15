const { AmongUsSocket } = require('@among-js/sus')
const { PlayerColor, matchmakingServers } = require('@among-js/data')
const consola = require('consola')

consola.wrapAll()

const code = 'RIVDTQ'
const username = 'tester'
const color = PlayerColor.Orange

const s = new AmongUsSocket(username)


// Follow the first player to move.
let firstNetId
s.on('playerMove', async (netId, position, velocity) => {
  if (!firstNetId) firstNetId = netId
  if (netId !== firstNetId) return

  await s.move(position, velocity)
})


;(async () => {
  await s.connect(22023, matchmakingServers.NA[0])
  consola.info(`Connected to server as ${username}`)

  const joined = await s.joinGame(code)
  consola.success(`Joined game ${code}`)
  consola.info(`Player id: ${joined.playerId}, host id: ${joined.hostId}`)

  await s.spawn(color)
  consola.success('Spawned player')
})().catch(consola.error)


// Clean up the socket cleanly to avoid reconnection issues.
process.on('SIGINT', () => {
  consola.info('Closing sockets')
  s.s.disconnect()
  process.exit()
})
