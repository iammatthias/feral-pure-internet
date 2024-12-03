import { execSync } from "child_process";

const RPI_APP_DIR = "/opt/feral";
const GITHUB_REPO = "your-username/feral-pure-internet";

const setup = async () => {
  console.log("Setting up Feral Pure Internet...");

  // System updates
  execSync("sudo apt update && sudo apt upgrade -y");

  // Install Node.js for ARM
  execSync(
    "curl -fsSL https://unofficial-builds.nodejs.org/download/release/v20.11.1/node-v20.11.1-linux-armv6l.tar.gz -o nodejs.tar.gz"
  );
  execSync("sudo tar -xzf nodejs.tar.gz -C /usr/local --strip-components=1");
  execSync("rm nodejs.tar.gz");

  // Install pnpm
  execSync("sudo npm i -g pnpm");

  // Setup app directory
  execSync(`sudo mkdir -p ${RPI_APP_DIR}`);
  execSync(`sudo chown -R $USER:$USER ${RPI_APP_DIR}`);

  // Clone repo
  execSync(`git clone https://github.com/${GITHUB_REPO}.git ${RPI_APP_DIR}/app`);

  // Install Caddy
  execSync(`
    sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo apt update && sudo apt install caddy
  `);

  // Configure Caddy
  const caddyConfig = `
your-domain.com {
    reverse_proxy localhost:3000
    encode gzip
    tls {
        dns cloudflare {env.CF_API_TOKEN}
    }
}`;
  execSync(`echo '${caddyConfig}' | sudo tee /etc/caddy/Caddyfile`);

  // Install PM2
  execSync("sudo npm i -g pm2");

  // Setup firewall
  execSync(`
    sudo apt install ufw
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw enable
  `);

  // Initial build and start
  process.chdir(`${RPI_APP_DIR}/app`);
  execSync("pnpm install");
  execSync("pnpm build");
  execSync("pm2 start ecosystem.config.js");
  execSync("pm2 save");
  execSync("pm2 startup");

  console.log("Setup complete! Feral Pure Internet is running.");
};

setup().catch(console.error);
