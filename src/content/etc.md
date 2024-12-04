### Etc

- NFC: https://iammatthias.com/posts/1732585567703-pure-internet-bluesky
  -- The idea was to store data URLs on an NFC tag. This fell apart because data URLs are not supported for top level navigation. The solution was to host minimal HTML on IPFS, and use JS to bootstrap a data URL from a url param into an iframe.
- Bluesky: https://iammatthias.com/posts/1732585567703-pure-internet-bluesky
  -- This was a fun experiment inspired by [Daniel Mangum's prior work](https://danielmangum.com/posts/this-website-is-hosted-on-bluesky/). It leverages a few pieces of Bluesky's underlying AtProtocol, namely the Personal Data Server (PDS) and content addressable blob storage.
