import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const EARTH_RADIUS_MILES = 3959; // Earth's radius in miles
const FUZZ_RADIUS_MILES = 10; // Maximum fuzzing radius in miles

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country_name: string;
  timezone: string;
  lastUpdated?: number;
}

// Add interface for ip-api.com response
interface IpApiResponse {
  status: string;
  lat: number;
  lon: number;
  city: string;
  regionName: string;
  country: string;
  timezone: string;
  message?: string;
}

export class LocationService {
  private cache: LocationData | null = null;
  private readonly CACHE_FILE = join(__dirname, "../../../cache/location.json");
  private readonly UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hour
  private updatePromise: Promise<LocationData> | null = null;

  constructor() {
    const cacheDir = join(__dirname, "../../../cache");
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }
    this.loadCache();
    this.updatePromise = this.updateLocation();
    this.startUpdateCycle();
  }

  private loadCache() {
    try {
      if (existsSync(this.CACHE_FILE)) {
        const data = readFileSync(this.CACHE_FILE, "utf-8");
        console.log("Loading cache from:", this.CACHE_FILE);
        // console.log("Cache data:", data);
        this.cache = JSON.parse(data);
      } else {
        console.log("No cache file found at:", this.CACHE_FILE);
        this.cache = null;
      }
    } catch (error) {
      console.error("Error loading cache:", error);
      this.cache = null;
    }
  }

  private saveCache() {
    try {
      console.log("Saving cache to:", this.CACHE_FILE);
      //   console.log("Cache data:", JSON.stringify(this.cache));
      writeFileSync(this.CACHE_FILE, JSON.stringify(this.cache));
    } catch (error) {
      console.error("Error saving cache:", error);
    }
  }

  private fuzzLocation(lat: number, lon: number): { latitude: number; longitude: number } {
    // Generate a random distance up to FUZZ_RADIUS_MILES
    const radiusMiles = Math.random() * FUZZ_RADIUS_MILES;

    // Generate a random angle in radians
    const angle = Math.random() * 2 * Math.PI;

    // Convert distance to angular distance (radians)
    const angularDistance = radiusMiles / EARTH_RADIUS_MILES;

    // Calculate fuzzy position using spherical geometry
    const lat1 = lat * (Math.PI / 180); // convert to radians
    const lon1 = lon * (Math.PI / 180);

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angularDistance) + Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(angle)
    );

    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(angle) * Math.sin(angularDistance) * Math.cos(lat1),
        Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
      );

    // Convert back to degrees and normalize longitude to [-180, 180]
    return {
      latitude: lat2 * (180 / Math.PI),
      longitude: ((lon2 * (180 / Math.PI) + 540) % 360) - 180,
    };
  }

  private async updateLocation(): Promise<LocationData> {
    try {
      console.log("Attempting to update location data...");
      // Using ip-api.com with specific fields to minimize response size
      const response = await fetch(
        "http://ip-api.com/json/?fields=status,message,lat,lon,city,regionName,country,timezone"
      );

      const data: IpApiResponse = await response.json();

      if (data.status !== "success") {
        throw new Error(`Location API error: ${data.message || "Unknown error"}`);
      }

      console.log("Received new location data:");

      // Fuzz the coordinates before storing
      const fuzzedCoords = this.fuzzLocation(data.lat, data.lon);

      const locationData: LocationData = {
        latitude: fuzzedCoords.latitude,
        longitude: fuzzedCoords.longitude,
        city: data.city,
        region: data.regionName,
        country_name: data.country,
        timezone: data.timezone,
        lastUpdated: Date.now(),
      };

      this.cache = locationData;
      this.saveCache();
      console.log("Location data updated and cached (coordinates fuzzed)");
      return locationData;
    } catch (error) {
      console.error("Error updating location:", error);
      if (this.cache) {
        console.log("Using cached location data from:", new Date(this.cache.lastUpdated || 0).toLocaleString());
        return this.cache;
      }
      throw error;
    }
  }

  private shouldUpdate(): boolean {
    if (!this.cache || !this.cache.lastUpdated) {
      console.log("No cache or timestamp, update needed");
      return true;
    }

    const cacheAge = Date.now() - this.cache.lastUpdated;
    // Reduced update frequency to stay within rate limits
    const shouldUpdate = cacheAge > 2 * 60 * 60 * 1000; // 2 hours
    console.log("Cache age:", Math.round(cacheAge / (60 * 1000)), "minutes,", "Update needed:", shouldUpdate);
    return shouldUpdate;
  }

  async getLocation(): Promise<LocationData> {
    console.log("getLocation called");

    if (this.cache && !this.shouldUpdate()) {
      console.log("Using valid cache");
      return this.cache;
    }

    console.log("Cache invalid or expired, updating...");
    if (!this.updatePromise) {
      this.updatePromise = this.updateLocation();
    }
    return this.updatePromise;
  }

  private startUpdateCycle() {
    setInterval(() => {
      if (this.shouldUpdate()) {
        console.log("Starting scheduled update");
        this.updatePromise = this.updateLocation();
      }
    }, this.UPDATE_INTERVAL);
  }
}
