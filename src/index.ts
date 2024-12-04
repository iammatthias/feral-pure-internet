import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { marked } from "marked";
import { readFileSync } from "fs";
import { join } from "path";
import { verifySignature, deploy } from "./deploy";
import { EcosystemData } from "./ecosystem";
import { layout } from "./views/layout";
import { renderEcosystem } from "./views/ecosystem";

const app = new Hono();
const ecosystem = new EcosystemData();

app.get("/", async (c) => {
  const home = readFileSync(join(__dirname, "content/home.md"), "utf-8");
  const etc = readFileSync(join(__dirname, "content/etc.md"), "utf-8");
  const data = await ecosystem.getData();

  return c.html(
    layout(`
    ${marked(home)}
    ${renderEcosystem(data)}
     ${marked(etc)}
  `)
  );
});

app.post("/deploy", async (c) => {
  const signature = c.req.header("x-hub-signature-256");
  const body = await c.req.text();

  if (!signature || !verifySignature(signature, body)) {
    return c.text("Invalid signature", 401);
  }

  deploy();
  return c.text("Deployment started");
});

serve(app, (info) => {
  console.log(`Feral Pure Internet listening on http://localhost:${info.port}`);
});
