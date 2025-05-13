import { useEffect, useState } from "react";
import type { EnvironmentalData } from "@shared/types";
import styles from "./Ecosystem.module.css";

export const Ecosystem = () => {
  const [data, setData] = useState<EnvironmentalData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/environment");
        if (!response.ok) {
          throw new Error("Failed to fetch environment data");
        }
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!data) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.ecosystem}>
      <p>
        Last checked: <span className={styles.timestamp}>{new Date(data.lastChecked).toLocaleString()}</span>
      </p>

      <section className={styles.section}>
        <h4 className={styles.heading}>Location Data</h4>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>🌍 Region</div>
            <div className={styles.cardContent}>
              {data.location.region}, {data.location.country}
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>📍 Coordinates</div>
            <div className={styles.cardContent}>
              {data.location.latitude}°, {data.location.longitude}°
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>⛰️ Elevation</div>
            <div className={styles.cardContent}>{data.location.elevation}m</div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={styles.heading}>Weather</h4>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>🌡️ Temperature</div>
            <div className={styles.cardContent}>
              {data.weather.temperature}°C
              <br />
              <small>Feels like {data.weather.feelsLike}°C</small>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>🌥️ Conditions</div>
            <div className={styles.cardContent}>{data.weather.condition}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>💨 Wind</div>
            <div className={styles.cardContent}>
              {data.weather.windSpeed}km/h {data.weather.windDirection}
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>💧 Humidity</div>
            <div className={styles.cardContent}>{data.weather.humidity}%</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>📊 Pressure</div>
            <div className={styles.cardContent}>{data.weather.pressure}hPa</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>☔️ Precipitation</div>
            <div className={styles.cardContent}>{data.weather.precipitationProbability}%</div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={styles.heading}>Air Quality</h4>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>💨 AQI</div>
            <div className={styles.cardContent}>{data.air.aqi}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>🔬 Particulates</div>
            <div className={styles.cardContent}>
              PM2.5: {data.air.pm25}μg/m³
              <br />
              <small>PM10: {data.air.pm10}μg/m³</small>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>🧪 Gases</div>
            <div className={styles.cardContent}>
              O₃: {data.air.o3}μg/m³
              <br />
              <small>NO₂: {data.air.no2}μg/m³</small>
              <br />
              <small>SO₂: {data.air.so2}μg/m³</small>
              <br />
              <small>CO: {data.air.co}μg/m³</small>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={styles.heading}>Celestial</h4>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>🌅 Daylight</div>
            <div className={styles.cardContent}>
              {data.astronomy.sunrise} - {data.astronomy.sunset}
              <br />
              <small>Length: {data.astronomy.dayLength}</small>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>🌙 Moon</div>
            <div className={styles.cardContent}>{data.astronomy.moonPhase}</div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>☀️ UV Index</div>
            <div className={styles.cardContent}>{data.weather.uvIndex}</div>
          </div>
        </div>
      </section>
    </div>
  );
};
