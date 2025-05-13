# feral.pure---internet.com

This is an exploration of "pure internet".

It is built using [bhvr](https://bhvr.dev/) and [Cloudflare Tunnels](https://www.cloudflare.com/products/tunnel/) to serve a single page of HTML from a Raspberry Pi Zero W.

Soon, it will be solar powered, and the site will be available only when the sun is shining.

## Requirements

- Raspberry Pi Zero W with Raspbian OS
- Node.js v20+ (ARMv6)
- PNPM package manager
- GitHub account
- Cloudflare account
- WAQI API token (for air quality data)

## Local Development

```bash
# Clone repository
git clone https://github.com/iammatthias/feral-pure-internet.git
cd feral-pure-internet

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Add WAQI_TOKEN to .env

# Start development server
pnpm dev
```

## Raspberry Pi Deployment

1. Install Node.js (ARMv6):

```bash
curl -fsSL https://unofficial-builds.nodejs.org/download/release/v20.11.1/node-v20.11.1-linux-armv6l.tar.gz -o nodejs.tar.gz
sudo tar -xzf nodejs.tar.gz -C /usr/local --strip-components=1
rm nodejs.tar.gz
```

2. Install PNPM and PM2:

```bash
sudo npm i -g pnpm pm2
```

3. Setup application:

```bash
sudo mkdir -p /opt/feral
sudo chown -R $USER:$USER /opt/feral
cd /opt/feral
git clone https://github.com/iammatthias/feral-pure-internet.git app
cd app
pnpm install
```

4. Configure environment:

```bash
cp .env.example .env
# Add WAQI_TOKEN to .env
```

5. Start application:

```bash
pm2 start "pnpm dev" --name feral
pm2 save
```

## Cloudflare Tunnel

1. Install cloudflared:

```bash
# Download and install
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm > cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin
```

2. Configure tunnel:

```bash
# Authenticate
cloudflared login

# Create tunnel
cloudflared tunnel create feral
cloudflared tunnel route dns feral your-domain.com

# Configure
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << EOF
tunnel: YOUR_TUNNEL_ID
ingress:
  - hostname: your-domain.com
    service: http://localhost:3000
  - service: http_status:404
EOF
```

3. Run as service:

```bash
sudo mkdir -p /etc/cloudflared /root/.cloudflared
sudo cp ~/.cloudflared/cert.pem /root/.cloudflared/
sudo cp ~/.cloudflared/config.yml /etc/cloudflared/
sudo cp ~/.cloudflared/*.json /root/.cloudflared/
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

## etc

- NFC
  -- https://iammatthias.com/posts/1732585567703-pure-internet-bluesky
  -- The idea here was simple. Store a data URL on an NFC tag. When scanned, the data URL is loaded in the browser. This fell apart because data URLs are not supported for top level navigation. The solution was to host minimal HTML on IPFS, and use JS to bootstrap a data URL from a url param into an iframe.
- Bluesky
  -- https://iammatthias.com/posts/1732585567703-pure-internet-bluesky
  -- This was a fun experiment inspired by [Daniel Mangum's prior work](https://danielmangum.com/posts/this-website-is-hosted-on-bluesky/). It leverages a few pieces of Bluesky's underlying AtProtocol, namely the Personal Data Server (PDS) and content addressable blob storage.
