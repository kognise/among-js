import { assert } from 'console'
import { JoinGameErrorPayloadPacket, JoinGameRequestPayloadPacket } from './types'

export function assertNever(value: never): never {
  throw new Error(`Unhandled case ${value}`)
}

export function assertJoinGameErrorPayloadPacket(value: JoinGameErrorPayloadPacket | JoinGameRequestPayloadPacket): asserts value is JoinGameErrorPayloadPacket {
  assert('reason' in value, 'assertJoinGameErrorPayloadPacket failed')
}

export function assertJoinGameRequestPayloadPacket(value: JoinGameErrorPayloadPacket | JoinGameRequestPayloadPacket): asserts value is JoinGameRequestPayloadPacket {
  assert('code' in value, 'assertJoinGameRequestPayloadPacket failed')
}