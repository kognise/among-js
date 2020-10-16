# Among JS

The most comprehensive set of utilities for interacting with the Among Us protocol written in TypeScript. It's composed of several self-contained libraries:

- Data: constants, enums, types, static game data, and more
- Hazel: a library for interacting with the Hazel network protocol
- Packets: rich Among Us packet parsing and serialization with a programmer-friendly API
- Sus: simple and expressive object-oriented library for easily making bots and clients
- Util: general utilities for reading bytes and more

Among JS was designed with browser support in mind, meaning when the Hazel library supports WebSocket transports you'll be able to run Among Us bots and clients fully on the web *as well as* Node.js!

In it's current state not all packets and events are supported but I'm focusing on rapid iteration. Every current feature is fully tested and stable.

## Development

This is a monorepo using Yarn, TSDX, and Lerna. Woo, buzzwords!

Anyways, after cloning the repo, you'll want to run `yarn` to install dependencies and `yarn dev` to start a TypeScript build watcher. Then just `node example.js` to run the example code. You can also run `yarn lint` to format all the code for consistency.

You can find more information about the protocol in this [freshly made wiki](https://wiki.weewoo.net/wiki/Protocol) I helped create.