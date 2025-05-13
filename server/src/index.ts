import { Hono } from "hono";
import { cors } from "hono/cors";
import { LocationService } from "./services/location.service";
import { EnvironmentService } from "./services/environment.service";

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
