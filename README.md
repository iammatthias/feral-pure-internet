# feral.pure---internet.com

Built using [bhvr](https://bhvr.dev/) and a Raspberry Pi Zero 2.

The Pi is powered by a [Stealth Cam Sol-Pak](https://www.amazon.com/Stealth-Cam-Rechargeable-Insulated-Compatible/dp/B087S7XGS9) with a built in 300mAh battery. It outputs 10v, so a buck converter is used to step down to 5v.

This is an open source work in progress.

## Tech Stack

- bhvr\*\* (Bun + Hono + Vite + React)
- Cloudflare Tunnel
- Raspberry Pi Zero 2 W

---

## Requirements

- Raspberry Pi Zero 2 W
- Cloudflare account + domain
- WAQI API token

## Local Development

```bash
git clone https://github.com/iammatthias/feral-pure-internet.git
cd feral-pure-internet
bun install          # installs client, server, shared
cp .env.example .env # add WAQI_TOKEN to .env in server
bun run dev -- --host 0.0.0.0 --port 5173
# client  → http://localhost:5173
# server  → http://localhost:3000/api/*
```

## Raspberry Pi Deployment

### 1 – Install Bun (64‑bit OS)

```bash
curl -fsSL https://bun.sh/install | bash
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### 2 – Clone repository

```bash
sudo mkdir -p /opt/feral && sudo chown $USER:$USER /opt/feral
cd /opt/feral
git clone https://github.com/iammatthias/feral-pure-internet.git app
cd app
```

### 3 – Build & copy bundle

```bash
bun install
bun run build                       # shared + client + server
cp -r client/dist/* server/dist/client/
```

### 4 – systemd service

```ini
# /etc/systemd/system/feral.service
[Unit]
Description=Feral – serve compiled bundle on 3000
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=feral
WorkingDirectory=/opt/feral/app
Environment=WAQI_TOKEN=[TOKEN]
ExecStart=/home/feral/.bun/bin/bun run server/dist/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now feral
```

### 5 – Cloudflare Tunnel

```bash
cloudflared tunnel create feral
cloudflared tunnel route dns feral feral.pure---internet.com
```

`/etc/cloudflared/config.yml`

```yaml
tunnel: <TUNNEL_UUID>
credentials-file: /etc/cloudflared/<TUNNEL_UUID>.json

ingress:
  - hostname: feral.pure---internet.com
    service: http://localhost:3000
  - service: http_status:404
```

```bash
sudo cp ~/.cloudflared/*.json /etc/cloudflared/
sudo systemctl enable --now cloudflared
```

---

## Update Workflow on Pi

```bash
cd /opt/feral/app
git pull --ff-only
./build.sh
sudo systemctl restart feral
```
