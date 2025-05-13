import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { LocationService } from "./services/location.service";
import { EnvironmentService } from "./services/environment.service";

// Validate required environment variables
const requiredEnvVars = ["WAQI_TOKEN"] as const;
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error("Missing required environment variables:", missingEnvVars.join(", "));
  console.error("Please ensure these are set in your .env file or environment");
  process.exit(1);
}

type Variables = {
  locationService: LocationService;
  environmentService: EnvironmentService;
};

export const app = new Hono<{ Variables: Variables }>()
  .use(cors())
  .use("*", async (c, next) => {
    // Initialize services
    const locationService = new LocationService();
    const environmentService = new EnvironmentService(locationService);

    // Add services to context
    c.set("locationService", locationService);
    c.set("environmentService", environmentService);

    await next();
  })
  // Serve static files from client/dist
  .use(
    "*",
    serveStatic({
      root: "./client/dist",
      rewriteRequestPath: (p) => (p === "/" ? "/index.html" : p),
    })
  )
  .get("/", (c) => {
    return c.text("Feral Pure Internet API");
  })
  .get("/api/environment", async (c) => {
    const environmentService = c.get("environmentService");
    const data = await environmentService.getEnvironment();
    return c.json(data);
  })
  .get("/api/location", async (c) => {
    const locationService = c.get("locationService");
    const data = await locationService.getLocation();
    return c.json(data);
  });

export default app;
