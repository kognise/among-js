import assert from 'assert'
import {
  JoinGameErrorPayloadPacket,
  JoinGameRequestPayloadPacket
} from './types'

/**
 * Assert that the packet is an error (server -> client) instead of a join request.
 * 
 * @param value Join error or join request
 */
export function assertJoinGameErrorPayloadPacket(
  value: JoinGameErrorPayloadPacket | JoinGameRequestPayloadPacket
): asserts value is JoinGameErrorPayloadPacket {
  assert('reason' in value, 'assertJoinGameErrorPayloadPacket failed')
}

/**
 * Assert that the packet is a join request (client -> server) instead of an error.
 * 
 * @param value Join error or join request
 */
export function assertJoinGameRequestPayloadPacket(
  value: JoinGameErrorPayloadPacket | JoinGameRequestPayloadPacket
): asserts value is JoinGameRequestPayloadPacket {
  assert('code' in value, 'assertJoinGameRequestPayloadPacket failed')
}
