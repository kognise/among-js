![Among JS](https://raw.githubusercontent.com/kognise/among-js/main/banner.svg)

Among JS is a set of utilities for interacting with the Among Us protocol written in TypeScript. It's composed of several self-contained libraries which are all published to NPM:

- Data: constants, enums, types, static game data, and more
- Hazel: a library for interacting with the Hazel network protocol
- Packets: rich Among Us packet parsing and serialization with a programmer-friendly API
- Sus: simple and expressive object-oriented library for easily making bots and clients
- Util: general utilities for reading bytes and more

Among JS was designed with browser support in mind, meaning when the Hazel library supports WebSocket transports you'll be able to run Among Us bots and clients fully on the web *as well as* Node.js!

In it's current state not all packets and events are supported but I'm focusing on rapid iteration. Every current feature is fully tested and stable.

You can find more information about the protocol in this [freshly made wiki](https://wiki.weewoo.net/wiki/Protocol) I helped create.