# feral<br/>pure internet

Built using [Hono](https://hono.dev/), [Cloudflare Tunnels](https://www.cloudflare.com/products/tunnel/), and a Raspberry Pi Zero W.

The Raspberry Pi is powered by an [Stealth Cam Sol-Pak](https://www.amazon.com/Stealth-Cam-Rechargeable-Insulated-Compatible/dp/B0DB6LQMKH). This panel outputs 10v, so a buck converter is used to step the voltage down to 5v.

This is an [open source](https://github.com/iammatthias/feral-pure-internet) work in progress.

### Ecosystem

Ecosystem data is provided by the [Open-Meteo](https://open-meteo.com/) and [WAQI](https://aqicn.org/api/) APIs for weather and air quality. We cache the results, and recheck every 10 minutes.
