import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { marked } from "marked";
import { readFileSync } from "fs";
import { join } from "path";
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

serve(app, (info) => {
  console.log(`Feral Pure Internet listening on http://localhost:${info.port}`);
});
