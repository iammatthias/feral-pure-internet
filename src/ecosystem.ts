import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import suncalc from "suncalc";

interface EnvironmentalData {
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

export class EcosystemData {
  private cache: EnvironmentalData | null = null;
  private readonly CACHE_FILE = join(__dirname, "../cache/ecosystem.json");
  private readonly UPDATE_INTERVAL = 10 * 60 * 1000;

  constructor() {
    const cacheDir = join(__dirname, "../cache");
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }
    try {
      this.cache = JSON.parse(readFileSync(this.CACHE_FILE, "utf-8"));
    } catch {
      this.cache = null;
    }
  }

  private obfuscateCoordinate(coord: number): number {
    return Math.round(coord * 10) / 10;
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

  private formatDayLength(ms: number): string {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  private async fetchWithRetry(
    url: URL | string,
    options: {
      retries?: number;
      timeout?: number;
      delay?: number;
      validateResponse?: boolean;
    } = {}
  ): Promise<Response> {
    const { retries = 3, timeout = 10000, delay = 2000, validateResponse = true } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    for (let i = 0; i < retries; i++) {
      try {
        const urlString = url.toString();
        console.log(`API attempt ${i + 1} of ${retries} for ${urlString}`);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Feral-Pure-Internet/1.0",
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error Details:", {
            status: response.status,
            statusText: response.statusText,
            url: urlString,
            response: errorText,
          });
          throw new Error(`API error ${response.status}: ${errorText}`);
        }

        if (validateResponse) {
          const contentType = response.headers.get("content-type");
          if (!contentType?.includes("application/json")) {
            console.error("Invalid content type:", contentType);
            throw new Error(`Expected JSON but got ${contentType}`);
          }
        }

        return response;
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error) {
          console.error(`Attempt ${i + 1} failed:`, {
            message: error.message,
            cause: error.cause,
            url: url.toString(),
          });
        }

        if (i === retries - 1) {
          throw error;
        }

        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error(`Max retries (${retries}) reached`);
  }

  async getData(): Promise<EnvironmentalData> {
    if (this.cache && Date.now() - this.cache.lastChecked < this.UPDATE_INTERVAL) {
      return this.cache;
    }

    try {
      const locationRes = await fetch("https://ipapi.co/json/");
      const locationData = await locationRes.json();

      const preciseCoords = {
        lat: locationData.latitude,
        lon: locationData.longitude,
      };

      console.log("Preparing weather data request...");
      const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");

      console.log("Using location:", {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });

      const params = {
        latitude: locationData.latitude.toString(),
        longitude: locationData.longitude.toString(),
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "precipitation",
          "wind_speed_10m",
          "wind_direction_10m",
          "weather_code",
          "apparent_temperature",
        ].join(","),
        hourly: ["pressure_msl", "uv_index", "visibility", "precipitation_probability"].join(","),
      };

      Object.entries(params).forEach(([key, value]) => {
        weatherUrl.searchParams.append(key, value);
        console.log(`Added parameter ${key}:`, value);
      });

      console.log("Weather API URL:", weatherUrl.toString());

      const weatherResponse = await this.fetchWithRetry(weatherUrl, {
        retries: 3,
        timeout: 10000,
        delay: 3000,
        validateResponse: true,
      });

      const weatherData = await weatherResponse.json();
      console.log("Weather data response structure:", Object.keys(weatherData));

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
        const airRes = await fetch(
          `https://api.waqi.info/feed/geo:${preciseCoords.lat};${preciseCoords.lon}/` +
            `?token=${process.env.WAQI_TOKEN}`
        );
        const airData = await airRes.json();

        if (airData.status === "ok") {
          airQuality = {
            aqi: airData.data.aqi || 0,
            pm25: airData.data.iaqi?.pm25?.v || 0,
            pm10: airData.data.iaqi?.pm10?.v || 0,
            o3: airData.data.iaqi?.o3?.v || 0,
            no2: airData.data.iaqi?.no2?.v || 0,
            so2: airData.data.iaqi?.so2?.v || 0,
            co: airData.data.iaqi?.co?.v || 0,
          };
        }
      } catch (error) {
        console.error("Error fetching air quality data:", error);
      }

      const times = suncalc.getTimes(new Date(), preciseCoords.lat, preciseCoords.lon);
      const moonIllum = suncalc.getMoonIllumination(new Date());

      this.cache = {
        location: {
          latitude: this.obfuscateCoordinate(preciseCoords.lat),
          longitude: this.obfuscateCoordinate(preciseCoords.lon),
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
          dayLength: this.formatDayLength(times.sunset - times.sunrise),
        },
        lastChecked: Date.now(),
      };

      this.saveCache();
      return this.cache;
    } catch (error: unknown) {
      console.error("Error in getData:", {
        message: error instanceof Error ? error.message : "Unknown error",
        cause: error instanceof Error ? error.cause : undefined,
        stack: error instanceof Error ? error.stack : undefined,
        type: error instanceof Error ? error.name : typeof error,
      });

      if (this.cache) {
        console.log("Returning stale cache due to error");
        return this.cache;
      }
      throw error;
    }
  }
}
