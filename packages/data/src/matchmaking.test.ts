import { matchmakingServers } from './matchmaking'

test('servers exist', () => {
  expect(matchmakingServers.NA).toBeTruthy()
  expect(matchmakingServers.EU).toBeTruthy()
  expect(matchmakingServers.ASIA).toBeTruthy()
})
