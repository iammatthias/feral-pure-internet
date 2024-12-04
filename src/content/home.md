# feral.pure---internet.com

This is an exploration of "pure internet".

It is built using [Hono](https://hono.dev/) and [Cloudflare Tunnels](https://www.cloudflare.com/products/tunnel/) to serve a single page of HTML from a Raspberry Pi Zero W.

Soon, it will be solar powered, and the site will be available only when the sun is shining.

### Ecosystem

Ecosystem data is provided by the [Open-Meteo API](https://open-meteo.com/). We cache the results, and recheck every 10 minutes.
