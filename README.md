![Among JS](https://raw.githubusercontent.com/kognise/among-js/main/banner.svg)

Among JS is a set of utilities for interacting with the Among Us protocol written in TypeScript. It's composed of several self-contained libraries which are all published to NPM:

- Data: constants, enums, types, static game data, and more ([docs](https://among-js-docs.vercel.app/modules/data.html))
- Hazel: a library for interacting with the Hazel network protocol ([docs](https://among-js-docs.vercel.app/modules/hazel.html))
- Packets: rich Among Us packet parsing and serialization with a programmer-friendly API ([docs](https://among-js-docs.vercel.app/modules/packets.html))
- Sus: simple and expressive object-oriented library for easily making bots and clients ([docs](https://among-js-docs.vercel.app/modules/sus.html))
- Util: general utilities for reading bytes and more ([docs](https://among-js-docs.vercel.app/modules/util.html))

Among JS was designed with browser support in mind, meaning when the Hazel library supports WebSocket transports you'll be able to run Among Us bots and clients fully on the web *as well as* Node.js!

In it's current state not all packets and events are supported but I'm focusing on rapid iteration. Every current feature is fully manually tested and stable. Currently unit test coverage is low but increasing.

You can find more information about the protocol in this [freshly made wiki](https://wiki.weewoo.net/wiki/Protocol) I helped create.

They're a bit of a WIP, but feel free to [read the documentation](https://among-js-docs.vercel.app/). If you have any feedback, create a GitHub issue or shoot be a DM on Discord @Kognise#6356.