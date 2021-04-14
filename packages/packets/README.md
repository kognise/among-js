# Packets | Among JS

Rich Among Us packet parsing and serialization with a programmer-friendly API. This is part of Among JS, a simple and flexible library for interacting with the Among Us protocol.

This library was designed with extreme simplicity in mind. **For most use cases, the only functions you'll need are `parsePayloads` and `generatePayloads`**, both of which can be imported directly. As you may be able to guess, the former parses a buffer into a rich manipulatable structure, and the latter does the opposite.

This is meant to be used with a library like `@among-js/hazel` to strip packet headers, and `bytebuffer` for manipulating buffers.

## Basic Concepts

The base of the Among Us protocol is a list of "payloads." Each payload has a type, like game data or join game, and some payloads have inner payloads.

For example, say you have a payload of type game data. This has an array of parts, each one being an inner payload. One part might be of type RPC, which has further instructions inside. Etcetera.

For more technical information on the protocol you may be interested in reading [the protocol wiki](https://wiki.weewoo.net/wiki/Protocol).

## Game Codes

You may notice that game codes are stored as numbers. This is how Among Us internally stores them and allows for much better normalization.

Specifically, version 2 (6 character) codes are represented as large negative numbers which is generated through a complex algorithm that is out of the scope of this specific package. To convert a v2 code into something this package can understand use the `v2CodeToNumber` function which is exported from `@among-js/util`.

For more in-depth information, read [this wiki page](https://wiki.weewoo.net/wiki/Game_Codes).
