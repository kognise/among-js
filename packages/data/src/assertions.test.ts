import {
  assertJoinGameErrorPayloadPacket,
  assertJoinGameRequestPayloadPacket
} from './assertions'
import { PayloadType } from './enums'
import {
  JoinGameErrorPayloadPacket,
  JoinGameRequestPayloadPacket
} from './types'

const joinGameRequest:
  | JoinGameErrorPayloadPacket
  | JoinGameRequestPayloadPacket = {
  type: PayloadType.JoinGame,
  code: -1
}

const joinGameError:
  | JoinGameErrorPayloadPacket
  | JoinGameRequestPayloadPacket = {
  type: PayloadType.JoinGame,
  reason: new Error('oh noes uwu')
}

test('assertJoinGameErrorPayloadPacket', () => {
  expect(() => assertJoinGameErrorPayloadPacket(joinGameError)).not.toThrow()
  expect(() => assertJoinGameErrorPayloadPacket(joinGameRequest)).toThrow()

  expect(() =>
    assertJoinGameRequestPayloadPacket(joinGameRequest)
  ).not.toThrow()
  expect(() => assertJoinGameRequestPayloadPacket(joinGameError)).toThrow()
})
