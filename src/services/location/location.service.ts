import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country_name: string;
  timezone: string;
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
      this.cache = JSON.parse(readFileSync(this.CACHE_FILE, "utf-8"));
    } catch {
      this.cache = null;
    }
  }

  private saveCache() {
    writeFileSync(this.CACHE_FILE, JSON.stringify(this.cache));
  }

  private async updateLocation(): Promise<LocationData> {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      this.cache = data;
      this.saveCache();
      return data;
    } catch (error) {
      console.error("Error updating location:", error);
      if (this.cache) {
        return this.cache;
      }
      throw error;
    }
  }

  private startUpdateCycle() {
    setInterval(() => {
      this.updatePromise = this.updateLocation();
    }, this.UPDATE_INTERVAL);
  }

  async getLocation(): Promise<LocationData> {
    if (!this.cache) {
      if (!this.updatePromise) {
        this.updatePromise = this.updateLocation();
      }
      return this.updatePromise;
    }
    return this.cache;
  }
}
