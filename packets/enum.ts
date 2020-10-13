// Base packet types.
// https://wiki.weewoo.net/wiki/Protocol
export enum PacketType {
  Normal = 0,
  Reliable = 1,
  Hello = 8,
  Disconnect = 9,
  Acknowledgement = 10,
  Ping = 12
}

// Packet payload types.
// https://wiki.weewoo.net/wiki/Protocol#Reliable_Packets
export enum PayloadType {
  CreateGame = 0,
  JoinGame,
  StartGame,
  RemoveGame,
  RemovePlayer,
  GameData,
  GameDataTo,
  JoinedGame,
  EndGame,
  AlterGame = 10,
  KickPlayer,
  WaitForHost,
  Redirect,
  ReselectServer,
  GetGameList = 9,
  GetGameListV2 = 16
}

// Game data (and game data to) types.
// https://wiki.weewoo.net/wiki/Protocol#5.2C_6_-_Game_Data_and_Game_Data_To
export enum GameDataType {
  Data = 1,
  RPC,
  Spawn = 4,
  Despawn,
  SceneChange,
  Ready,
  ChangeSettings
}

// RPC instruction types.
// https://wiki.weewoo.net/wiki/Protocol#2_-_RPC_Game_Data
export enum RPCFlag {
  PlayAnimation = 0,
  CompleteTask,
  SyncSettings,
  SetInfected,
  Exiled,
  CheckName,
  SetName,
  CheckColor,
  SetColor,
  SetHat,
  SetSkin,
  ReportDeadBody,
  MurderPlayer,
  SendChat,
  StartMeeting,
  SetScanner,
  SendChatNote,
  SetPet,
  SetStartCounter,
  EnterVent,
  ExitVent,
  SnapTo,
  Close,
  VotingComplete,
  CastVote,
  ClearVote,
  AddVote,
  CloseDoorsOfType,
  RepairSystem,
  SetTasks,
  UpdateGameData
}

export enum DisconnectReason {
  None = 0,
  GameFull,
  GameStarted,
  GameNotFound,
  CustomLegacy,
  OutdatedClient,
  Banned,
  Kicked,
  Custom,
  InvalidUsername,
  Hacking,
  Force = 16,
  BadConnection,
  GameNotFound2,
  ServerClosed,
  ServerOverloaded
}

export enum GameSetting {
  OnlineGame = 'OnlineGame'
}

export enum PlayerColor {
  Red = 0,
  Blue,
  DarkGreen,
  Pink,
  Orange,
  Yellow,
  Black,
  White,
  Purple,
  Brown,
  Cyan,
  Lime
}

// Below this line are just functions to convert enums into human-readable
// names for debugging.

export const prettyPayloadType = (type: PayloadType) => {
  switch (type) {
    case PayloadType.CreateGame: return 'create game'
    case PayloadType.JoinGame: return 'join game'
    case PayloadType.StartGame: return 'start game'
    case PayloadType.RemoveGame: return 'remove game'
    case PayloadType.RemovePlayer: return 'remove player'
    case PayloadType.GameData: return 'game data'
    case PayloadType.GameDataTo: return 'game data (to)'
    case PayloadType.JoinedGame: return 'joined game'
    case PayloadType.EndGame: return 'end game'
    case PayloadType.AlterGame: return 'alter game'
    case PayloadType.KickPlayer: return 'kick player'
    case PayloadType.WaitForHost: return 'wait for host'
    case PayloadType.Redirect: return 'redirect'
    case PayloadType.ReselectServer: return 'reselect server'

    case PayloadType.GetGameList:
    case PayloadType.GetGameListV2:
      return 'get game list'

    default: return `unknown (${type})`
  }
}

export const prettyDisconnectReason = (reason: DisconnectReason) => {
  switch (reason) {
    case DisconnectReason.GameFull: 'The game you tried to join is full.\nCheck with the host to see if you can join next round.'
    case DisconnectReason.GameStarted: 'The game you tried to join already started.\nCheck with the host to see if you can join next round.'
    case DisconnectReason.OutdatedClient: 'You are running an older version of the game.\nPlease update to play with others.'

    case DisconnectReason.Banned: 'You were banned from the room.\nYou cannot rejoin that room.'
    case DisconnectReason.Kicked: 'You were kicked from the room.\nYou cannot rejoin that room.'

    case DisconnectReason.InvalidUsername: 'Server refused username.'
    case DisconnectReason.Hacking: 'You were banned for hacking.\nPlease stop.'
    case DisconnectReason.BadConnection: 'You disconnected from the host.\nIf this happens often, check your WiFi strength.'

    case DisconnectReason.ServerClosed: 'The server stopped this game. Possibly due to inactivity.'
    case DisconnectReason.ServerOverloaded: 'The Among Us servers are overloaded.\nSorry! Please try again later!'

    case DisconnectReason.GameNotFound:
    case DisconnectReason.GameNotFound2:
      return `Could not find the game you're looking for.`

    case DisconnectReason.CustomLegacy:
    case DisconnectReason.Custom:
      return 'Custom'

    case DisconnectReason.None:
    case DisconnectReason.Force:
      'Forcibly disconnected from the server:\nThe remote sent a disconnect request.'
  }
}

export const prettyRPCType = (type: RPCFlag) => {
  switch (type) {
    case RPCFlag.PlayAnimation: return 'PlayAnimation'
    case RPCFlag.CompleteTask: return 'CompleteTask'
    case RPCFlag.SyncSettings: return 'SyncSettings'
    case RPCFlag.SetInfected: return 'SetInfected'
    case RPCFlag.Exiled: return 'Exiled'
    case RPCFlag.CheckName: return 'CheckName'
    case RPCFlag.SetName: return 'SetName'
    case RPCFlag.CheckColor: return 'CheckColor'
    case RPCFlag.SetColor: return 'SetColor'
    case RPCFlag.SetHat: return 'SetHat'
    case RPCFlag.SetSkin: return 'SetSkin'
    case RPCFlag.ReportDeadBody: return 'ReportDeadBody'
    case RPCFlag.MurderPlayer: return 'MurderPlayer'
    case RPCFlag.SendChat: return 'SendChat'
    case RPCFlag.StartMeeting: return 'StartMeeting'
    case RPCFlag.SetScanner: return 'SetScanner'
    case RPCFlag.SendChatNote: return 'SendChatNote'
    case RPCFlag.SetPet: return 'SetPet'
    case RPCFlag.SetStartCounter: return 'SetStartCounter'
    case RPCFlag.EnterVent: return 'EnterVent'
    case RPCFlag.ExitVent: return 'ExitVent'
    case RPCFlag.SnapTo: return 'SnapTo'
    case RPCFlag.Close: return 'Close'
    case RPCFlag.VotingComplete: return 'VotingComplete'
    case RPCFlag.CastVote: return 'CastVote'
    case RPCFlag.ClearVote: return 'ClearVote'
    case RPCFlag.AddVote: return 'AddVote'
    case RPCFlag.CloseDoorsOfType: return 'CloseDoorsOfType'
    case RPCFlag.RepairSystem: return 'RepairSystem'
    case RPCFlag.SetTasks: return 'SetTasks'
    case RPCFlag.UpdateGameData: return 'UpdateGameData'
  }
}

export const prettyGameDataType = (type: GameDataType) => {
  switch (type) {
    case GameDataType.Data: return 'generic data'
    case GameDataType.RPC: return 'rpc'
    case GameDataType.Spawn: return 'spawn'
    case GameDataType.Despawn: return 'despawn'
    case GameDataType.SceneChange: return 'scene change'
    case GameDataType.Ready: return 'ready'
    case GameDataType.ChangeSettings: return 'change settings'
  }
}