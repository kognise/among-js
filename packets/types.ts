import { Vector2 } from '../util/vector'
import { GameDataType, GameSetting, PayloadType, RPCFlag } from './enum'

// Payload packets
export type PayloadPacket = GameDataPayloadPacket | GameDataToPayloadPacket | JoinedGamePayloadPacket | RedirectPayloadPacket | JoinGameErrorPayloadPacket | JoinGameRequestPayloadPacket

export interface GameDataPayloadPacket {
  type: PayloadType.GameData,
  code: number,
  parts: GameDataPacket[]
}

export interface GameDataToPayloadPacket {
  type: PayloadType.GameDataTo,
  code: number,
  recipient: number,
  parts: GameDataPacket[]
}

export interface JoinedGamePayloadPacket {
  type: PayloadType.JoinedGame,
  code: number,
  playerId: number,
  hostId: number
}

export interface JoinGameErrorPayloadPacket {
  type: PayloadType.JoinGame,
  reason: Error
}

export interface JoinGameRequestPayloadPacket {
  type: PayloadType.JoinGame,
  code: number
}

export interface RedirectPayloadPacket {
  type: PayloadType.Redirect,
  port: number,
  ip: string
}

// Game data packets
export type GameDataPacket = RPCGameDataPacket | SpawnGameDataPacket | DataGameDataPacket | SceneChangeGameDataPacket

export interface RPCGameDataPacket {
  type: GameDataType.RPC,
  netId: number,
  flag: RPCFlag,
  data: ByteBuffer
}

export interface SpawnGameDataPacket {
  type: GameDataType.Spawn,
  spawnId: number,
  ownerId: number,
  flags: number,
  components: GameComponent[]
}

export interface DataGameDataPacket {
  type: GameDataType.Data,
  netId: number,
  sequence: number,
  position: Vector2,
  velocity: Vector2
}

export interface SceneChangeGameDataPacket {
  type: GameDataType.SceneChange,
  playerId: number,
  setting: GameSetting
}

// Game component
export interface GameComponent {
  netId: number,
  data: ByteBuffer
}