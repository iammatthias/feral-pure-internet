export const renderEcosystem = (data: EnvironmentalData) => `
    <p>Last checked: ${new Date(data.lastChecked).toLocaleString()}</p>
    <h3>Location Data</h3>
    <div class="grid">
      <div class="card">
        <div class="card-title">🌍 Region</div>
        ${data.location.region}, ${data.location.country}
      </div>
      <div class="card">
        <div class="card-title">📍 Coordinates</div>
        ${data.location.latitude}°, ${data.location.longitude}°
      </div>
      <div class="card">
        <div class="card-title">⛰️ Elevation</div>
        ${data.location.elevation}m
      </div>
    </div>

    <h3>Weather</h3>
    <div class="grid">
      <div class="card">
        <div class="card-title">🌡️ Temperature</div>
        ${data.weather.temperature}°C
        <small>Feels like ${data.weather.feelsLike}°C</small>
      </div>
      <div class="card">
        <div class="card-title">🌥️ Conditions</div>
        ${data.weather.condition}
      </div>
      <div class="card">
        <div class="card-title">💨 Wind</div>
        ${data.weather.windSpeed}km/h ${data.weather.windDirection}
      </div>
      <div class="card">
        <div class="card-title">💧 Humidity</div>
        ${data.weather.humidity}%
      </div>
      <div class="card">
        <div class="card-title">📊 Pressure</div>
        ${data.weather.pressure}hPa
      </div>
      <div class="card">
        <div class="card-title">☔️ Precipitation</div>
        ${data.weather.precipitationProbability}%
      </div>
    </div>

    <h3>Air Quality</h3>
    <div class="grid">
      <div class="card">
        <div class="card-title">💨 AQI</div>
        ${data.air.aqi}
      </div>
      <div class="card">
        <div class="card-title">🔬 Particulates</div>
        PM2.5: ${data.air.pm25}μg/m³
        <small>PM10: ${data.air.pm10}μg/m³</small>
      </div>
      <div class="card">
        <div class="card-title">🧪 Gases</div>
        O₃: ${data.air.o3}μg/m³
        <small>NO₂: ${data.air.no2}μg/m³</small>
        <small>SO₂: ${data.air.so2}μg/m³</small>
        <small>CO: ${data.air.co}μg/m³</small>
      </div>
    </div>

    <h3>Celestial</h3>
    <div class="grid">
      <div class="card">
        <div class="card-title">🌅 Daylight</div>
        ${data.astronomy.sunrise} - ${data.astronomy.sunset}
        <small>Length: ${data.astronomy.dayLength}</small>
      </div>
      <div class="card">
        <div class="card-title">🌙 Moon</div>
        ${data.astronomy.moonPhase}
      </div>
      <div class="card">
        <div class="card-title">☀️ UV Index</div>
        ${data.weather.uvIndex}
      </div>
    </div>

`;
