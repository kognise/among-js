import { Vector2 } from '@among-js/util'
import {
  GameDataType,
  SceneChangeLocation,
  PayloadType,
  RPCFlag,
  Language,
  AmongUsMap,
  PlayerColor,
  GameOverReason
} from './enums'

/**
 * All payload packets. {@link https://wiki.weewoo.net/wiki/Protocol#Reliable_Packets}
 */
export type PayloadPacket =
  | GameDataPayloadPacket
  | GameDataToPayloadPacket
  | JoinedGamePayloadPacket
  | RedirectPayloadPacket
  | JoinGameErrorPayloadPacket
  | JoinGameRequestPayloadPacket
  | EndGamePayloadPacket
  | StartGamePayloadPacket

/**
 * Game data packet. {@link https://wiki.weewoo.net/wiki/Protocol#5.2C_6_-_Game_Data_and_Game_Data_To}
 */
export interface GameDataPayloadPacket {
  type: PayloadType.GameData
  code: number
  parts: GameDataPacket[]
}

/**
 * Game data to packet. Similar to `GameDataPayloadPacket` but it has a recipient as well.
 * {@link https://wiki.weewoo.net/wiki/Protocol#5.2C_6_-_Game_Data_and_Game_Data_To}
 */
export interface GameDataToPayloadPacket {
  type: PayloadType.GameDataTo
  code: number
  recipient: number
  parts: GameDataPacket[]
}

/**
 * End game packet, for when the current game is over.
 * This removes the client from the room so it'll have to rejoin.
 */
export interface EndGamePayloadPacket {
  type: PayloadType.EndGame,
  code: number,
  endReason: GameOverReason,
  showAd: boolean
}

/**
 * Start game packet, for when the current game is starting.
 */
export interface StartGamePayloadPacket {
  type: PayloadType.StartGame,
  code: number
}

/**
 * Joined game packet, sent after joining is a success.
 */
export interface JoinedGamePayloadPacket {
  type: PayloadType.JoinedGame
  code: number
  playerClientId: number
  hostClientId: number
}

/**
 * Represents an error while joining a game, sent from the server to the client.
 * 
 * Be wary that `JoinGameRequestPayloadPacket` has the same payload type but a
 * different format. You can use `assertJoinGameErrorPayloadPacket` to make sure
 * that a packet is an error and not a request.
 * 
 * {@link https://wiki.weewoo.net/wiki/Protocol#Server_To_Client}
 */
export interface JoinGameErrorPayloadPacket {
  type: PayloadType.JoinGame
  reason: Error
}

/**
 * A request to join a game, sent from the client to the server.
 * 
 * Be wary that `JoinGameErrorPayloadPacket` has the same payload type but a
 * different format. You can use `assertJoinGameRequestPayloadPacket` to make sure
 * that a packet is a request and not an error.
 * 
 * {@link https://wiki.weewoo.net/wiki/Protocol#Client_To_Server}
 */
export interface JoinGameRequestPayloadPacket {
  type: PayloadType.JoinGame
  code: number
}

/**
 * A packet sent by the server to instruct the client to disconnect
 * and retry the last message on the given server.
 * {@link https://wiki.weewoo.net/wiki/Protocol#13_-_Redirect}
 */
export interface RedirectPayloadPacket {
  type: PayloadType.Redirect
  port: number
  ip: string
}

/**
 * Game data and game data to packets. {@link https://wiki.weewoo.net/wiki/Protocol#5.2C_6_-_Game_Data_and_Game_Data_To}
 */
export type GameDataPacket =
  | RPCGameDataPacket
  | SpawnGameDataPacket
  | DataGameDataPacket
  | SceneChangeGameDataPacket

/**
 * Packet to spawn an entity with a list of components. {@link https://wiki.weewoo.net/wiki/Protocol#4_-_Spawn}
 */
export interface SpawnGameDataPacket {
  type: GameDataType.Spawn
  spawnId: number
  ownerId: number
  flags: number
  components: GameComponent[]
}

/**
 * Data packet, right now only for movement. {@link https://wiki.weewoo.net/wiki/Protocol#1_-_Data}
 */
export interface DataGameDataPacket {
  type: GameDataType.Data
  netId: number
  sequence: number
  position: Vector2
  velocity: Vector2
}

/**
 * Packet for requesting a scene change, most useful for getting a spawn point.
 * {@link https://wiki.weewoo.net/wiki/Protocol#6_-_Scene_Change}
 */
export interface SceneChangeGameDataPacket {
  type: GameDataType.SceneChange
  playerClientId: number
  location: SceneChangeLocation
}

/**
 * Remote procedure call packet bodies. These are actually extensions
 * of the regular game data packet but with more data including an RPC flag.
 * {@link https://wiki.weewoo.net/wiki/Protocol#2_-_RPC_Game_Data}
 */
export type RPCGameDataPacket =
  | SyncSettingsRPCGameDataPacket
  | CheckNameRPCGameDataPacket
  | CheckColorRPCGameDataPacket
  | SetColorRPCGameDataPacket
  | UnparsedRPCGameDataPacket
  | UpdateGameDataRPCGameDataPacket
  | SetNameRPCGameDataPacket
  | VotingCompleteRPCGameDataPacket

/**
 * Sync game options between clients.
 */
export interface SyncSettingsRPCGameDataPacket {
  type: GameDataType.RPC
  flag: RPCFlag.SyncSettings
  netId: number
  gameOptions: GameOptions
}

/**
 * When all votes have been placed in a meeting.
 */
export interface VotingCompleteRPCGameDataPacket {
  type: GameDataType.RPC,
  flag: RPCFlag.VotingComplete,
  exiled: number | null,
  tie: boolean
}

/**
 * Check if a name is available and set it.
 */
export interface CheckNameRPCGameDataPacket {
  type: GameDataType.RPC
  flag: RPCFlag.CheckName
  netId: number
  name: string
}

/**
 * Set a player name. Prefer `CheckNameRPCGameDataPacket`.
 */
export interface SetNameRPCGameDataPacket {
  type: GameDataType.RPC
  flag: RPCFlag.SetName
  netId: number
  name: string
}

/**
 * Check if a color is available and set it.
 */
export interface CheckColorRPCGameDataPacket {
  type: GameDataType.RPC
  flag: RPCFlag.CheckColor
  netId: number
  color: PlayerColor
}

/**
 * Set a player color. Prefer `CheckColorRPCGameDataPacket`.
 */
export interface SetColorRPCGameDataPacket {
  type: GameDataType.RPC
  flag: RPCFlag.SetColor
  netId: number
  color: PlayerColor
}

/**
 * Update the game data for multiple players. See `GameData` for more information.
 */
export interface UpdateGameDataRPCGameDataPacket {
  type: GameDataType.RPC
  flag: RPCFlag.UpdateGameData
  netId: number
  players: GameData[]
}

/**
 * All unsupported RPC packets are represented with this type, so until support
 * is added you can read from the buffer in `data`.
 */
export interface UnparsedRPCGameDataPacket {
  type: GameDataType.RPC
  // Next line is cursed, fuck typescript
  flag: Exclude<
    RPCFlag,
    | RPCFlag.CheckName
    | RPCFlag.SyncSettings
    | RPCFlag.CheckColor
    | RPCFlag.SetName
    | RPCFlag.SetColor
    | RPCFlag.UpdateGameData
    | RPCFlag.VotingComplete
  >
  netId: number
  data: ByteBuffer
}

/**
 * Component on a Unity GameObject. {@link https://wiki.weewoo.net/wiki/Components}
 */
export interface GameComponent {
  netId: number
  data: ByteBuffer
}

/**
 * Game options/settings. {@link https://wiki.weewoo.net/wiki/Game_Options_Data}
 */
export interface GameOptions {
  maxPlayers: number
  language: Language
  map: AmongUsMap
  playerSpeedModifier: number
  crewLightModifier: number
  impostorLightModifier: number
  killCooldown: number
  commonTasks: number
  longTasks: number
  shortTasks: number
  emergencies: number
  impostors: number
  killDistance: number
  discussionTime: number
  votingTime: number
  isDefault: boolean
  emergencyCooldown: number
  confirmEjects: boolean
  visualTasks: boolean
}

/**
 * Game data, used for representing information about players.
 */
export interface GameData {
  playerId: number
  playerName: string
  color: PlayerColor
  hat: number
  pet: number
  skin: number
  disconnected: boolean
  isImpostor: boolean
  isDead: boolean
  tasks: TaskInfo[]
}

/**
 * In-game task info.
 */
export interface TaskInfo {
  type: number
  complete: boolean
}
