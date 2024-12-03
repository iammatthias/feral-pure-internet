# Feral Pure Internet

This is an exploration of "pure internet". The notion that things have been complicated by the internet as a service, and that the halcyon days of sharing simple hypertext are gone only as long as we allow.

## Previous explorations

- NFC
  -- https://iammatthias.com/posts/1732585567703-pure-internet-bluesky
  -- The idea here was simple. Store a data URL on an NFC tag. When scanned, the data URL is loaded in the browser. This fell apart because data URLs are not supported for top level navigation. The solution was to host minimal HTML on IPFS, and use JS to bootstrap a data URL from a url param into an iframe.
- Bluesky
  -- https://iammatthias.com/posts/1732585567703-pure-internet-bluesky
  -- This was a fun experiment inspired by [Daniel Mangum's prior work](https://danielmangum.com/posts/this-website-is-hosted-on-bluesky/). It leverages a few pieces of Bluesky's underlying AtProtocol, namely the Personal Data Server (PDS) and content addressable blob storage.

## This exploration

This is a monorepo built with pnpm workspaces, and is deployed to a Raspberry Pi Zero W.

## Local Development

```bash
# Install pnpm if not installed
brew install pnpm

# Install dependencies
pnpm install

# Start development server
pnpm dev
```
