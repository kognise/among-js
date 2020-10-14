import assert from 'assert'
import {
  JoinGameErrorPayloadPacket,
  JoinGameRequestPayloadPacket
} from './types'

// Assert that the packet is an error (server -> client)
export function assertJoinGameErrorPayloadPacket(
  value: JoinGameErrorPayloadPacket | JoinGameRequestPayloadPacket
): asserts value is JoinGameErrorPayloadPacket {
  assert('reason' in value, 'assertJoinGameErrorPayloadPacket failed')
}

// Assert that the packet is a request (client -> server)
export function assertJoinGameRequestPayloadPacket(
  value: JoinGameErrorPayloadPacket | JoinGameRequestPayloadPacket
): asserts value is JoinGameRequestPayloadPacket {
  assert('code' in value, 'assertJoinGameRequestPayloadPacket failed')
}
