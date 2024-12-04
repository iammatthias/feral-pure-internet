export const renderEcosystem = (data: EnvironmentalData) => `
    <p>Last checked: <span class="timestamp" data-time="${data.lastChecked}"></span></p>
    <h4>Location Data</h4>
    <div class="grid">
      <div class="card">
        <div class="card-title">🌍 Region</div>
        <div class="card-content">${data.location.region}, ${data.location.country}</div>
      </div>
      <div class="card">
        <div class="card-title">📍 Coordinates</div>
        <div class="card-content">${data.location.latitude}°, ${data.location.longitude}°</div>
      </div>
      <div class="card">
        <div class="card-title">⛰️ Elevation</div>
        <div class="card-content">${data.location.elevation}m</div>
      </div>
    </div>

    <h4>Weather</h4>
    <div class="grid">
      <div class="card">
        <div class="card-title">🌡️ Temperature</div>
        <div class="card-content">${data.weather.temperature}°C<br/>
        <small>Feels like ${data.weather.feelsLike}°C</small></div>
      </div>
      <div class="card">
        <div class="card-title">🌥️ Conditions</div>
        <div class="card-content">${data.weather.condition}</div>
      </div>
      <div class="card">
        <div class="card-title">💨 Wind</div>
        <div class="card-content">${data.weather.windSpeed}km/h ${data.weather.windDirection}</div>
      </div>
      <div class="card">
        <div class="card-title">💧 Humidity</div>
        <div class="card-content">${data.weather.humidity}%</div>
      </div>
      <div class="card">
        <div class="card-title">📊 Pressure</div>
        <div class="card-content">${data.weather.pressure}hPa</div>
      </div>
      <div class="card">
        <div class="card-title">☔️ Precipitation</div>
        <div class="card-content">${data.weather.precipitationProbability}%</div>
      </div>
    </div>

    <h4>Air Quality</h4>
    <div class="grid">
      <div class="card">
        <div class="card-title">💨 AQI</div>
        <div class="card-content">${data.air.aqi}</div>
      </div>
      <div class="card">
        <div class="card-title">🔬 Particulates</div>
        <div class="card-content">PM2.5: ${data.air.pm25}μg/m³<br/>
        <small>PM10: ${data.air.pm10}μg/m³</small></div>
      </div>
      <div class="card">
        <div class="card-title">🧪 Gases</div>
        <div class="card-content">O₃: ${data.air.o3}μg/m³<br/>
        <small>NO₂: ${data.air.no2}μg/m³</small><br/>
        <small>SO₂: ${data.air.so2}μg/m³</small><br/>
        <small>CO: ${data.air.co}μg/m³</small></div>
      </div>
    </div>

    <h4>Celestial</h4>
    <div class="grid">
      <div class="card">
        <div class="card-title">🌅 Daylight</div>
        <div class="card-content">${data.astronomy.sunrise} - ${data.astronomy.sunset}<br/>
        <small>Length: ${data.astronomy.dayLength}</small></div>
      </div>
      <div class="card">
        <div class="card-title">🌙 Moon</div>
        <div class="card-content">${data.astronomy.moonPhase}</div>
      </div>
      <div class="card">
        <div class="card-title">☀️ UV Index</div>
        <div class="card-content">${data.weather.uvIndex}</div>
      </div>
    </div>

`;
