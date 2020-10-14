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

export enum SceneChangeLocation {
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
