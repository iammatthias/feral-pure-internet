import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import suncalc from "suncalc";
import { LocationService } from "../location/location.service";

interface WeatherAPIResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  hourly: {
    pressure_msl: number[];
    uv_index: number[];
    visibility: number[];
    precipitation_probability: number[];
  };
  elevation?: number;
}

interface AirQualityAPIResponse {
  status: string;
  data: {
    aqi: number;
    iaqi: {
      pm25?: { v: number };
      pm10?: { v: number };
      o3?: { v: number };
      no2?: { v: number };
      so2?: { v: number };
      co?: { v: number };
    };
  };
}

export interface EnvironmentalData {
  location: {
    latitude: number;
    longitude: number;
    region: string;
    country: string;
    timezone: string;
    elevation: number;
  };
  weather: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: string;
    condition: string;
    uvIndex: number;
    visibility: number;
    precipitationProbability: number;
  };
  air: {
    aqi: number;
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
  astronomy: {
    sunrise: string;
    sunset: string;
    moonPhase: string;
    dayLength: string;
  };
  lastChecked: number;
}

export class EnvironmentService {
  private cache: EnvironmentalData | null = null;
  private readonly CACHE_FILE = join(__dirname, "../../../cache/ecosystem.json");
  private readonly UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private updatePromise: Promise<EnvironmentalData> | null = null;

  constructor(private locationService: LocationService) {
    const cacheDir = join(__dirname, "../../../cache");
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }
    this.loadCache();
    this.updatePromise = this.updateEnvironment();
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

  private getWindDirection(degrees: number): string {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    return directions[Math.round(degrees / 22.5) % 16];
  }

  private getWeatherCondition(code: number): string {
    const conditions: Record<number, string> = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Light snow",
      73: "Moderate snow",
      75: "Heavy snow",
      95: "Thunderstorm",
    };
    return conditions[code] || "Unknown";
  }

  private getMoonPhase(phase: number): string {
    const phases = [
      "New Moon",
      "Waxing Crescent",
      "First Quarter",
      "Waxing Gibbous",
      "Full Moon",
      "Waning Gibbous",
      "Last Quarter",
      "Waning Crescent",
    ];
    return phases[Math.round(phase * 8) % 8];
  }

  private formatDayLength(milliseconds: number): string {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  private async updateEnvironment(): Promise<EnvironmentalData> {
    try {
      const locationData = await this.locationService.getLocation();

      if (!locationData?.latitude || !locationData?.longitude) {
        throw new Error("Invalid location data: Missing coordinates");
      }

      const weatherApiUrl = new URL("https://api.open-meteo.com/v1/forecast");
      weatherApiUrl.searchParams.append("latitude", locationData.latitude.toString());
      weatherApiUrl.searchParams.append("longitude", locationData.longitude.toString());
      weatherApiUrl.searchParams.append(
        "current",
        "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m"
      );
      weatherApiUrl.searchParams.append("hourly", "pressure_msl,uv_index,visibility,precipitation_probability");
      weatherApiUrl.searchParams.append("forecast_days", "1");
      weatherApiUrl.searchParams.append("timezone", "auto");

      const weatherRes = await fetch(weatherApiUrl.toString());
      const weatherData = (await weatherRes.json()) as WeatherAPIResponse;

      if (!weatherData?.current) {
        throw new Error("Invalid weather data received");
      }

      let airQuality = {
        aqi: 0,
        pm25: 0,
        pm10: 0,
        o3: 0,
        no2: 0,
        so2: 0,
        co: 0,
      };

      try {
        if (!process.env.WAQI_TOKEN) {
          console.warn("Missing WAQI_TOKEN environment variable");
          throw new Error("Missing WAQI_TOKEN");
        }

        const airRes = await fetch(
          `https://api.waqi.info/feed/geo:${locationData.latitude};${locationData.longitude}/?token=${process.env.WAQI_TOKEN}`
        );
        const airData = (await airRes.json()) as AirQualityAPIResponse;

        if (airData.status === "ok" && airData.data) {
          airQuality = {
            aqi: airData.data.aqi,
            pm25: airData.data.iaqi?.pm25?.v || 0,
            pm10: airData.data.iaqi?.pm10?.v || 0,
            o3: airData.data.iaqi?.o3?.v || 0,
            no2: airData.data.iaqi?.no2?.v || 0,
            so2: airData.data.iaqi?.so2?.v || 0,
            co: airData.data.iaqi?.co?.v || 0,
          };

          //   console.log("Parsed air quality data:", airQuality);
          console.log("Parsed air quality data");
        } else {
          console.warn("Invalid air quality data format:", airData);
        }
      } catch (error) {
        console.error("Error fetching air quality data:", error);
      }

      const now = new Date();
      const times = suncalc.getTimes(now, locationData.latitude, locationData.longitude);
      const moonIllum = suncalc.getMoonIllumination(now);

      const dayLengthMs = times.sunset.getTime() - times.sunrise.getTime();

      this.cache = {
        location: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          region: `${locationData.city}, ${locationData.region}`,
          country: locationData.country_name,
          timezone: locationData.timezone,
          elevation: weatherData.elevation || 0,
        },
        weather: {
          temperature: weatherData.current.temperature_2m,
          feelsLike: weatherData.current.apparent_temperature,
          humidity: weatherData.current.relative_humidity_2m,
          pressure: weatherData.hourly.pressure_msl[0],
          windSpeed: weatherData.current.wind_speed_10m,
          windDirection: this.getWindDirection(weatherData.current.wind_direction_10m),
          condition: this.getWeatherCondition(weatherData.current.weather_code),
          uvIndex: weatherData.hourly.uv_index[0],
          visibility: weatherData.hourly.visibility[0] / 1000,
          precipitationProbability: weatherData.hourly.precipitation_probability[0],
        },
        air: airQuality,
        astronomy: {
          sunrise: times.sunrise.toLocaleTimeString(),
          sunset: times.sunset.toLocaleTimeString(),
          moonPhase: this.getMoonPhase(moonIllum.phase),
          dayLength: this.formatDayLength(dayLengthMs),
        },
        lastChecked: Date.now(),
      };

      this.saveCache();
      return this.cache;
    } catch (error) {
      console.error("Error updating environment:", error);
      if (this.cache) {
        console.warn("Using cached environmental data");
        return this.cache;
      }
      throw error;
    }
  }

  private startUpdateCycle() {
    setInterval(() => {
      this.updatePromise = this.updateEnvironment();
    }, this.UPDATE_INTERVAL);
  }

  async getEnvironment(): Promise<EnvironmentalData> {
    if (!this.cache) {
      if (!this.updatePromise) {
        this.updatePromise = this.updateEnvironment();
      }
      return this.updatePromise;
    }
    return this.cache;
  }
}
