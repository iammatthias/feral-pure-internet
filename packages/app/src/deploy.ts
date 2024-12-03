import { spawn } from "child_process";
import crypto from "crypto";

const SECRET = process.env.WEBHOOK_SECRET || "your-secret-here";
const APP_DIR = "/opt/feral/app";

export const verifySignature = (signature: string, body: string) => {
  const hmac = crypto.createHmac("sha256", SECRET);
  const digest = "sha256=" + hmac.update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
};

export const deploy = () => {
  const deployment = spawn(
    "bash",
    [
      "-c",
      `
    cd ${APP_DIR} && \
    git pull && \
    pnpm install && \
    pnpm build && \
    pm2 restart feral-pure-internet
  `,
    ],
    {
      detached: true,
      stdio: "ignore",
    }
  );

  deployment.unref();
};
