import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country_name: string;
  timezone: string;
  lastUpdated?: number;
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
        console.log("Cache data:");
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
      console.log("Cache data:", JSON.stringify(this.cache));
      writeFileSync(this.CACHE_FILE, JSON.stringify(this.cache));
    } catch (error) {
      console.error("Error saving cache:", error);
    }
  }

  private async updateLocation(): Promise<LocationData> {
    try {
      console.log("Attempting to update location data...");
      const response = await fetch("https://ipapi.co/json/");

      if (response.status === 429) {
        console.log("Rate limited by ipapi.co, using cache");
        if (this.cache) {
          return this.cache;
        }
        throw new Error("Rate limited and no cache available");
      }

      if (!response.ok) {
        throw new Error(`Location API error (${response.status}): ${await response.text()}`);
      }

      const data = await response.json();
      //   console.log("Received new location data:", data);
      console.log("Received new location data:");

      const locationData: LocationData = {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        region: data.region,
        country_name: data.country_name,
        timezone: data.timezone,
        lastUpdated: Date.now(),
      };

      this.cache = locationData;
      this.saveCache();
      console.log("Location data updated and cached");
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
    const shouldUpdate = cacheAge > 24 * 60 * 60 * 1000; // 24 hours
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

  // Add this new method to validate the API response
  private isValidLocationData(data: any): data is LocationData {
    return (
      typeof data === "object" &&
      typeof data.latitude === "number" &&
      typeof data.longitude === "number" &&
      typeof data.city === "string" &&
      typeof data.region === "string" &&
      typeof data.country_name === "string" &&
      typeof data.timezone === "string"
    );
  }
}
