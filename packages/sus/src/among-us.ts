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

/**
 * Simple and clean wrapper for making Among Us clients and bots.
 *
 * If you're reading this through TypeDoc, I **highly** recommend unchecking "Inherited"
 * in the top right corner. It'll make it so you only have to see the methods and properties
 * that are pertinent to Among JS.
 *
 * @example
 * ```typescript
 * import { AmongUsSocket } from '@among-js/sus'
 * import { PlayerColor, matchmakingServers } from '@among-js/data'
 *
 * const socket = new AmongUsSocket('testing')
 * await socket.connect(22023, matchmakingServers.NA[1])
 * await socket.joinGame('ABCDEF')
 * await socket.spawn(PlayerColor.Lime)
 * ```
 */
export class AmongUsSocket extends EventEmitter {
  private name: string
  private game: Game | null = null
  private moveSequence: number = -1
  private components: GameComponent[] = []

  /**
   * The internal Hazel socket. This is exposed in case you want to
   * do things like sending raw packets or disconnecting.
   */
  s: HazelUDPSocket

  /**
   * Whether or not the client is ready to move around and perform actions.
   */
  ready = false

  /**
   * @param name Username to login with
   */
  constructor(name: string) {
    super()
    this.name = name
    this.s = new HazelUDPSocket('udp4')
  }

  /**
   * Connect to a port and ip address. This also performs a handshake to properly initialize the version and username.
   *
   * If you don't know what server to connect to, get an ip from the `matchmakingServers` export from `@among-js/data`
   * and use 22023 as a port. You may also want to consider setting up a local {@link https://github.com/AeonLucid/Impostor | Impostor}
   * server for testing without putting load on the official servers.
   *
   * @param port Port
   * @param ip Ip address
   */
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

  /**
   * Shitty code to attempt joining a game. This will respond with one of three states:
   *   - Joined, meaning no further action must be taken
   *   - Redirect, meaning the current socket should be scrapped and the join should be retried on the given ip and port
   *   - Error, meaning it should throw an error
   *
   * @param code Game code to join, as a string
   */
  private async tryJoin(code: string) {
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

  /**
   * Join an Among Us game, and handle join errors as well as redirects.
   * **This only connects! To get an avatar, receive events, and move around
   * you must use the `spawn` function.`
   *
   * @param code Game code to join, as a string
   */
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
        console.info(`Redirecting to ${joinResult.ip}:${joinResult.port}`)
        await this.s.disconnect()
        this.s = new HazelUDPSocket('udp4')
        await this.connect(joinResult.port, joinResult.ip)
      }
    }
  }

  /**
   * Spawn the player with an avatar and username, and begin emitting events.
   *
   * @param color The color to spawn with, from `@among-js/data`
   */
  async spawn(color: PlayerColor) {
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

  /**
   * Move to a position with a velocity.
   *
   * @param position Position to move to
   * @param velocity Character controller velocity
   *
   * @beta
   */
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
