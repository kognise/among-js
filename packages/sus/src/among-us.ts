import {
  PacketType,
  PayloadType,
  assertJoinGameErrorPayloadPacket,
  PlayerColor,
  GameDataType,
  RPCFlag,
  SceneChangeLocation,
  GameComponent
} from '@among-js/data'
import { HazelUDPSocket } from '@among-js/hazel'
import { parsePayloads, generatePayloads } from '@among-js/packets'
import { v2CodeToNumber, Vector2 } from '@among-js/util'
import ByteBuffer from 'bytebuffer'
import { EventEmitter } from 'events'

interface Game {
  code: string
  playerClientId: number
  hostClientId: number
}

interface JoinedJoinResult {
  state: 'joined'
  game: Game
}

interface ErrorJoinResult {
  state: 'error'
  error: Error
}

interface RedirectJoinResult {
  state: 'redirect'
  ip: string
  port: number
}

type JoinResult = JoinedJoinResult | ErrorJoinResult | RedirectJoinResult

export declare interface AmongUsSocket {
  on(
    event: 'playerMove',
    cb: (netId: number, position: Vector2, velocity: Vector2) => void
  ): this
}

// Clean wrapper for the Among Us protocol.
// (Well, the usage is clean, the internal code isn't.)
export class AmongUsSocket extends EventEmitter {
  s: HazelUDPSocket
  private name: string
  private game: Game | null = null
  private moveSequence: number = -1
  private components: GameComponent[] = []
  ready = false

  constructor(name: string) {
    super()
    this.name = name
    this.s = new HazelUDPSocket('udp4')
  }

  async connect(port: number, ip: string) {
    await this.s.connect(port, ip)

    // Send a hello with a username and wait for the response.
    const hello = new ByteBuffer(6 + this.name.length)
    hello.writeByte(0)
    hello.writeInt32(0x46_d2_02_03)
    hello.writeByte(this.name.length)
    hello.writeString(this.name)
    await this.s.sendReliable(PacketType.Hello, hello)
  }

  private async tryJoin(code: string) {
    // Shitty code to attempt joining a game. This will respond with
    // one of three states:
    // - Joined, meaning no further action must be taken
    // - Redirect, meaning the current socket should be scrapped and
    //   the join should be retried on the given ip and port
    // - Error, meaning it should throw an error

    const promise = new Promise<JoinResult>(resolve => {
      const cb = (buffer: ByteBuffer) => {
        const payloads = parsePayloads(buffer)

        for (const payload of payloads) {
          if (payload.type === PayloadType.JoinedGame) {
            this.s.off('message', cb)
            resolve({
              state: 'joined',
              game: {
                code,
                playerClientId: payload.playerClientId,
                hostClientId: payload.hostClientId
              }
            })
          } else if (payload.type === PayloadType.Redirect) {
            this.s.off('message', cb)
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

    // Actually send the join game packet now that the listener
    // is set up.
    await this.s.sendReliable(
      PacketType.Reliable,
      generatePayloads([
        {
          type: PayloadType.JoinGame,
          code: v2CodeToNumber(code)
        }
      ])
    )

    return await promise
  }

  async joinGame(code: string) {
    // Join a game and handle redirects and such. Uses tryJoin.

    let joinResult: JoinResult

    while (true) {
      joinResult = await this.tryJoin(code)
      if (joinResult.state === 'error') throw joinResult.error

      if (joinResult.state === 'joined') {
        this.game = joinResult.game
        return this.game
      }

      if (joinResult.state === 'redirect') {
        console.info(`Redirecting to ${joinResult.ip}:${joinResult.port}`)
        await this.s.disconnect()
        this.s = new HazelUDPSocket('udp4')
        await this.connect(joinResult.port, joinResult.ip)
      }
    }
  }

  async spawn(color: PlayerColor) {
    // Spawn the player with an avatar and username.

    const promise = new Promise(resolve => {
      this.s.on('message', async buffer => {
        const payloads = parsePayloads(buffer)

        for (const payload of payloads) {
          if (payload.type === PayloadType.GameData) {
            for (const part of payload.parts) {
              if (part.type === GameDataType.Spawn) {
                // When a spawn packet is received, send a two-part payload with the
                // desired username and color. The actual game sends these as two payloads
                // but this is equivalent.

                // Technically, I should check what it's actually spawning and add other logic
                // here, but I'm lazy so I'll do that when something breaks.

                this.components = part.components

                await this.s.sendReliable(
                  PacketType.Reliable,
                  generatePayloads([
                    {
                      type: PayloadType.GameDataTo,
                      recipient: this.game!.hostClientId,
                      code: v2CodeToNumber(this.game!.code),
                      parts: [
                        {
                          type: GameDataType.RPC,
                          flag: RPCFlag.CheckName,
                          netId: part.components[0].netId,
                          name: this.name
                        },
                        {
                          type: GameDataType.RPC,
                          flag: RPCFlag.CheckColor,
                          netId: part.components[0].netId,
                          color
                        }
                      ]
                    }
                  ])
                )

                resolve()
              } else if (part.type === GameDataType.Data) {
                this.moveSequence = part.sequence
                this.emit(
                  'playerMove',
                  part.netId,
                  part.position,
                  part.velocity
                )
              }
            }
          }
        }
      })
    })

    // Listener is setup, so request a scene change to get a spawn point.
    await this.s.sendReliable(
      PacketType.Reliable,
      generatePayloads([
        {
          type: PayloadType.GameData,
          code: v2CodeToNumber(this.game!.code),
          parts: [
            {
              type: GameDataType.SceneChange,
              playerClientId: this.game!.playerClientId,
              location: SceneChangeLocation.OnlineGame
            }
          ]
        }
      ])
    )

    await promise
    this.ready = true
  }

  async move(position: Vector2, velocity: Vector2) {
    await this.s.sendReliable(
      PacketType.Reliable,
      generatePayloads([
        {
          type: PayloadType.GameData,
          code: v2CodeToNumber(this.game!.code),
          parts: [
            {
              type: GameDataType.Data,
              netId: this.components[2].netId,
              sequence: ++this.moveSequence,
              position: position,
              velocity: velocity
            }
          ]
        }
      ])
    )
  }
}
