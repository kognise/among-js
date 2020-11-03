/**
 * Base packet types. {@link https://wiki.weewoo.net/wiki/Protocol}
 */
export enum PacketType {
  Normal = 0,
  Reliable = 1,
  Hello = 8,
  Disconnect = 9,
  Acknowledgement = 10,
  Ping = 12
}

/**
 * Packet payload types. {@link https://wiki.weewoo.net/wiki/Protocol#Reliable_Packets}
 */
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

/**
 * Game data (and game data to) types. {@link https://wiki.weewoo.net/wiki/Protocol#5.2C_6_-_Game_Data_and_Game_Data_To}
 */
export enum GameDataType {
  Data = 1,
  RPC,
  Spawn = 4,
  Despawn,
  SceneChange,
  Ready,
  ChangeSettings
}

/**
 * Remote procedure call types. https://wiki.weewoo.net/wiki/Protocol#2_-_RPC_Game_Data
 */
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

/**
 * Disconnect reasons. You can get the pretty form with `prettyDisconnectReason`.
 */
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

/**
 * Options for scene change requests. OnlineGame is currently the only option.
 */
export enum SceneChangeLocation {
  OnlineGame = 'OnlineGame'
}

/**
 * In-game player colors.
 */
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

/**
 * Playable maps.
 */
export enum AmongUsMap {
  Skeld = 0,
  MIRA,
  Polus
}

/**
 * Supported chat and interface languages.
 */
export enum Language {
  Other = 0b00000000_00000000_00000000_00000001,
  Spanish = 0b00000000_00000000_00000000_00000010,
  Korean = 0b00000000_00000000_00000000_00000100,
  Russian = 0b00000000_00000000_00000000_00001000,
  Portuguese = 0b00000000_00000000_00000000_00010000,
  Arabic = 0b00000000_00000000_00000000_00100000,
  Filipino = 0b00000000_00000000_00000000_01000000,
  Polish = 0b00000000_00000000_00000000_10000000,
  English = 0b00000000_00000000_00000001_00000000
}

/**
 * Locations for tasks.
 */
export enum Location {
  Hallway = 0,
  Storage,
  Cafeteria,
  Reactor,
  UpperEngine,
  Nav,
  Admin,
  Electrical,
  O2,
  Shields,
  MedBay,
  Security,
  Weapons,
  LowerEngine,
  Comms,
  ShipTasks,
  Doors,
  Sabotage,
  Decontamination,
  Launchpad,
  LockerRoom,
  Laboratory,
  Balcony,
  Office,
  Greenhouse
}

/**
 * In-game tasks that appear in the task list.
 */
export enum TaskType {
  SubmitScan = 0,
  PrimeShields,
  FuelEngines,
  ChartCourse,
  StartReactor,
  SwipeCard,
  ClearAsteroids,
  UploadData,
  InspectSample,
  EmptyChute,
  EmptyGarbage,
  AlignEngineOutput,
  FixWiring,
  CalibrateDistributor,
  DivertPower,
  UnlockManifolds,
  ResetReactor,
  FixLights,
  CleanO2Filter,
  FixComms,
  RestoreOxygen,
  StabilizeSteering,
  AssembleArtifact,
  SortSamples,
  MeasureWeather,
  EnterIdCode
}

/**
 * Reasons for games ending.
 */
export enum GameOverReason {
  CrewmatesByVote = 0,
  CrewmatesByTask,
  ImpostorByVote,
  ImpostorByKill,
  ImpostorBySabotage,
  ImpostorDisconnect,
  CrewmatesDisconnect
}

/**
 * Task bar updates game options setting.
 */
export enum TaskBarUpdates {
  Always = 0,
  Meetings,
  Never
}
