import { GameDataType, GameSetting, PacketType, PayloadType, PlayerColor, RPCFlag } from '../packets/enum'
import { HazelUdpSocket } from './hazel'
import { v2CodeToNumber } from '../util/codes'
import ByteBuffer from 'bytebuffer'
import { pack } from '../util/manipulation'
import consola from 'consola'
import { parsePayloads } from '../packets/parser'
import { assertJoinGameErrorPayloadPacket } from '../packets/assertions'
import { generatePayloads } from '../packets/generator'
import { quick } from '../util/quick'

interface Game {
  code: string
  playerId: number
  hostId: number
}

interface JoinedJoinResult {
  state: 'joined',
  game: Game
}

interface ErrorJoinResult {
  state: 'error',
  error: Error
}

interface RedirectJoinResult {
  state: 'redirect',
  ip: string,
  port: number
}

type JoinResult = JoinedJoinResult | ErrorJoinResult | RedirectJoinResult

export class AmongUsSocket {
  s: HazelUdpSocket
  private name: string
  private game: Game | null = null

  constructor(name: string) {
    this.name = name
    this.s = new HazelUdpSocket('udp4')
  }

  async connect(port: number, ip: string) {
    await this.s.connect(port, ip)

    const hello = new ByteBuffer(6 + this.name.length)
    hello.writeByte(0)
    hello.writeInt32(0x46_D2_02_03)
    hello.writeByte(this.name.length)
    hello.writeString(this.name)
    await this.s.sendReliable(PacketType.Hello, hello)
  }

  private async tryJoin(code: string) {
    const promise = new Promise<JoinResult>((resolve) => {
      const cb = (buffer: ByteBuffer) => {
        const payloads = parsePayloads(buffer)

        for (const payload of payloads) {
          if (payload.type === PayloadType.JoinedGame) {
            this.s.off('message', cb)
            resolve({
              state: 'joined',
              game: {
                code,
                playerId: payload.playerId,
                hostId: payload.hostId
              }
            })
          } else if (payload.type === PayloadType.Redirect) {
            resolve({
              state: 'redirect',
              ip: payload.ip,
              port: payload.port
            })
          } else if (payload.type === PayloadType.JoinGame) {
            assertJoinGameErrorPayloadPacket(payload)
            this.s.off('message', cb)
            resolve({
              state: 'error',
              error: payload.reason
            })
          }
        }
      }

      this.s.on('message', cb)
    })

    await this.s.sendReliable(PacketType.Reliable, generatePayloads([
      {
        type: PayloadType.JoinGame,
        code: v2CodeToNumber(code)
      }
    ]))

    return await promise
  }

  async joinGame(code: string) {
    let joinResult: JoinResult

    while (true) {
      joinResult = await this.tryJoin(code)
      if (joinResult.state === 'error') throw joinResult.error

      if (joinResult.state === 'joined') {
        this.game = joinResult.game
        return this.game
      }

      if (joinResult.state === 'redirect') {
        consola.info(`Redirecting to ${joinResult.ip}:${joinResult.port}`)
        await this.s.disconnect()
        this.s = new HazelUdpSocket('udp4')
        await this.connect(joinResult.port, joinResult.ip)
      }
    }
  }

  async spawn(color: PlayerColor) {
    this.s.on('message', async (buffer) => {
      const payloads = parsePayloads(buffer)
      
      for (const payload of payloads) {
        if (payload.type === PayloadType.GameData) {
          for (const part of payload.parts) {
            if (part.type === GameDataType.Spawn) {
              consola.info('Spawned')

              await this.s.sendReliable(PacketType.Reliable, generatePayloads([
                {
                  type: PayloadType.GameDataTo,
                  recipient: this.game!.hostId,
                  code: v2CodeToNumber(this.game!.code),
                  parts: [
                    {
                      type: GameDataType.RPC,
                      flag: RPCFlag.CheckName,
                      netId: part.components[0].netId,
                      data: quick(1 + this.name.length, (bb) => {
                        bb.writeByte(this.name.length)
                        bb.writeString(this.name)
                      })
                    },
                    {
                      type: GameDataType.RPC,
                      flag: RPCFlag.CheckColor,
                      netId: part.components[0].netId,
                      data: quick(1, (bb) => bb.writeByte(color))
                    }
                  ]
                }
              ]))
            }
          }
        }
      }
    })

    await this.s.sendReliable(PacketType.Reliable, generatePayloads([
      {
        type: PayloadType.GameData,
        code: v2CodeToNumber(this.game!.code),
        parts: [
          {
            type: GameDataType.SceneChange,
            playerId: this.game!.playerId,
            setting: GameSetting.OnlineGame
          }
        ]
      }
    ]))
  }
}