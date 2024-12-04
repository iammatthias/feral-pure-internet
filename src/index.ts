import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { marked } from "marked";
import { readFileSync } from "fs";
import { join } from "path";
import { LocationService } from "./services/location/location.service";
import { EnvironmentService } from "./services/environment/environment.service";
import { layout } from "./views/layout";
import { renderEcosystem } from "./views/ecosystem";

const app = new Hono();

// Initialize services
const locationService = new LocationService();
const environmentService = new EnvironmentService(locationService);

app.get("/", async (c) => {
  const home = readFileSync(join(__dirname, "content/home.md"), "utf-8");
  const etc = readFileSync(join(__dirname, "content/etc.md"), "utf-8");
  const data = await environmentService.getEnvironment();

  return c.html(
    layout(`
    ${marked(home)}
    ${renderEcosystem(data)}
    ${marked(etc)}
  `)
  );
});

// Add API endpoints for direct data access
app.get("/api/environment", async (c) => {
  const data = await environmentService.getEnvironment();
  return c.json(data);
});

app.get("/api/location", async (c) => {
  const data = await locationService.getLocation();
  return c.json(data);
});

serve(app, (info) => {
  console.log(`Feral Pure Internet listening on http://localhost:${info.port}`);
});