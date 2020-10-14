# Among JS

A client for the Among Us protocol written in TypeScript. This is very much a work-in-progress and doesn't do many things but it can join games!

This was built by dumping reverse-engineering UDP packets in Wireshark. Many things will probably break. Please don't use this for anything.

You can find more information about the protocol in this [freshly made wiki](https://wiki.weewoo.net/wiki/Protocol) I helped create.

## Development

This is a monorepo using Yarn, TSDX, and Lerna. Woo, buzzwords!

Anyways, after cloning the repo, you'll want to run `yarn` to install dependencies and `yarn dev` to start a TypeScript build watcher. Then just `node example.js` to run the example code.