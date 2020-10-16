// Just functions to convert enums into human-readable
// names for debugging.

import { PlayerColor } from '../dist'
import { PayloadType, DisconnectReason, RPCFlag, GameDataType } from './enums'

export const prettyPayloadType = (type: PayloadType) => {
  switch (type) {
    case PayloadType.CreateGame:
      return 'create game'
    case PayloadType.JoinGame:
      return 'join game'
    case PayloadType.StartGame:
      return 'start game'
    case PayloadType.RemoveGame:
      return 'remove game'
    case PayloadType.RemovePlayer:
      return 'remove player'
    case PayloadType.GameData:
      return 'game data'
    case PayloadType.GameDataTo:
      return 'game data (to)'
    case PayloadType.JoinedGame:
      return 'joined game'
    case PayloadType.EndGame:
      return 'end game'
    case PayloadType.AlterGame:
      return 'alter game'
    case PayloadType.KickPlayer:
      return 'kick player'
    case PayloadType.WaitForHost:
      return 'wait for host'
    case PayloadType.Redirect:
      return 'redirect'
    case PayloadType.ReselectServer:
      return 'reselect server'

    case PayloadType.GetGameList:
    case PayloadType.GetGameListV2:
      return 'get game list'

    default:
      return `unknown (${type})`
  }
}

export const prettyDisconnectReason = (reason: DisconnectReason) => {
  switch (reason) {
    case DisconnectReason.GameFull:
      return 'The game you tried to join is full.\nCheck with the host to see if you can join next round.'
    case DisconnectReason.GameStarted:
      return 'The game you tried to join already started.\nCheck with the host to see if you can join next round.'
    case DisconnectReason.OutdatedClient:
      return 'You are running an older version of the game.\nPlease update to play with others.'

    case DisconnectReason.Banned:
      return 'You were banned from the room.\nYou cannot rejoin that room.'
    case DisconnectReason.Kicked:
      return 'You were kicked from the room.\nYou cannot rejoin that room.'

    case DisconnectReason.InvalidUsername:
      return 'Server refused username.'
    case DisconnectReason.Hacking:
      return 'You were banned for hacking.\nPlease stop.'
    case DisconnectReason.BadConnection:
      return 'You disconnected from the host.\nIf this happens often, check your WiFi strength.'

    case DisconnectReason.ServerClosed:
      return 'The server stopped this game. Possibly due to inactivity.'
    case DisconnectReason.ServerOverloaded:
      return 'The Among Us servers are overloaded.\nSorry! Please try again later!'

    case DisconnectReason.GameNotFound:
    case DisconnectReason.GameNotFound2:
      return `Could not find the game you're looking for.`

    case DisconnectReason.CustomLegacy:
    case DisconnectReason.Custom:
      return 'Custom'

    case DisconnectReason.None:
    case DisconnectReason.Force:
      return 'Forcibly disconnected from the server:\nThe remote sent a disconnect request.'
  }
}

export const prettyRPCFlag = (type: RPCFlag) => {
  switch (type) {
    case RPCFlag.PlayAnimation:
      return 'PlayAnimation'
    case RPCFlag.CompleteTask:
      return 'CompleteTask'
    case RPCFlag.SyncSettings:
      return 'SyncSettings'
    case RPCFlag.SetInfected:
      return 'SetInfected'
    case RPCFlag.Exiled:
      return 'Exiled'
    case RPCFlag.CheckName:
      return 'CheckName'
    case RPCFlag.SetName:
      return 'SetName'
    case RPCFlag.CheckColor:
      return 'CheckColor'
    case RPCFlag.SetColor:
      return 'SetColor'
    case RPCFlag.SetHat:
      return 'SetHat'
    case RPCFlag.SetSkin:
      return 'SetSkin'
    case RPCFlag.ReportDeadBody:
      return 'ReportDeadBody'
    case RPCFlag.MurderPlayer:
      return 'MurderPlayer'
    case RPCFlag.SendChat:
      return 'SendChat'
    case RPCFlag.StartMeeting:
      return 'StartMeeting'
    case RPCFlag.SetScanner:
      return 'SetScanner'
    case RPCFlag.SendChatNote:
      return 'SendChatNote'
    case RPCFlag.SetPet:
      return 'SetPet'
    case RPCFlag.SetStartCounter:
      return 'SetStartCounter'
    case RPCFlag.EnterVent:
      return 'EnterVent'
    case RPCFlag.ExitVent:
      return 'ExitVent'
    case RPCFlag.SnapTo:
      return 'SnapTo'
    case RPCFlag.Close:
      return 'Close'
    case RPCFlag.VotingComplete:
      return 'VotingComplete'
    case RPCFlag.CastVote:
      return 'CastVote'
    case RPCFlag.ClearVote:
      return 'ClearVote'
    case RPCFlag.AddVote:
      return 'AddVote'
    case RPCFlag.CloseDoorsOfType:
      return 'CloseDoorsOfType'
    case RPCFlag.RepairSystem:
      return 'RepairSystem'
    case RPCFlag.SetTasks:
      return 'SetTasks'
    case RPCFlag.UpdateGameData:
      return 'UpdateGameData'
  }
}

export const prettyGameDataType = (type: GameDataType) => {
  switch (type) {
    case GameDataType.Data:
      return 'generic data'
    case GameDataType.RPC:
      return 'rpc'
    case GameDataType.Spawn:
      return 'spawn'
    case GameDataType.Despawn:
      return 'despawn'
    case GameDataType.SceneChange:
      return 'scene change'
    case GameDataType.Ready:
      return 'ready'
    case GameDataType.ChangeSettings:
      return 'change settings'
  }
}

export const prettyPlayerColor = (color: PlayerColor) => {
  switch (color) {
    case PlayerColor.Red: return 'red'
    case PlayerColor.Blue: return 'blue'
    case PlayerColor.DarkGreen: return 'dark green'
    case PlayerColor.Pink: return 'pink'
    case PlayerColor.Orange: return 'orange'
    case PlayerColor.Yellow: return 'yellow'
    case PlayerColor.Black: return 'black'
    case PlayerColor.White: return 'white'
    case PlayerColor.Purple: return 'purple'
    case PlayerColor.Brown: return 'brown'
    case PlayerColor.Cyan: return 'cyan'
    case PlayerColor.Lime: return 'lime'
  }
}