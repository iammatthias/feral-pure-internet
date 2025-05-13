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

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country_name: string;
  timezone: string;
  lastUpdated?: number;
}
