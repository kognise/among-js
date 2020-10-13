import { assert } from 'console'
import { JoinGameErrorPayloadPacket, JoinGameRequestPayloadPacket } from './types'

export function assertJoinGameErrorPayloadPacket(value: JoinGameErrorPayloadPacket | JoinGameRequestPayloadPacket): asserts value is JoinGameErrorPayloadPacket {
  // Assert that the packet is an error (server -> client)
  assert('reason' in value, 'assertJoinGameErrorPayloadPacket failed')
}

export function assertJoinGameRequestPayloadPacket(value: JoinGameErrorPayloadPacket | JoinGameRequestPayloadPacket): asserts value is JoinGameRequestPayloadPacket {
  // Assert that the packet is a request (client -> server)
  assert('code' in value, 'assertJoinGameRequestPayloadPacket failed')
}