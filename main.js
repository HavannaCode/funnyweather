"use strict";

const data = [
  ["13:00", 18, "☁️", 0.0],
  ["14:00", 17, "🌧️", 0.4],
  ["15:00", 17, "☁️", 0.1],
  ["16:00", 16, "🌦️", 0.3],
  ["17:00", 15, "☁️", 0.0],
  ["18:00", 14, "🌥️", 0.0]
];

const forecast = document.querySelector("#forecast");

for (const item of data) {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `
        <div class="time">${item[0]}</div>
        <div class="temp">${item[1]} °C</div>
        <div class="icon" aria-label="Bewölkung">${item[2]}</div>
        <div class="rain">${item[3].toFixed(1)} mm</div>
      `;
  forecast.append(row);
}

/**
      * Läd die Wetterdaten für die angegebenen Koordinaten.
      * Koordinaten werden berechnet via https://epsg.io/4326
      * OpenAPI-Doku für den Mode forecast: https://dataset.api.hub.geosphere.at/v1/openapi-docs#/forecast/Timeseries_Forecast_timeseries_forecast__resource_id__get
      * @param {string} Welche Wetter-Parameter das API liefern soll.
      */

function getCoordinates() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function getweather(parameter, coordinates) {
  const url = `https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/nwp-v1-1h-2500m?parameters=${parameter}&lat_lon=${coordinates}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geosphere API Error: ${res.status}`);
  }
  const json = await res.json();

  const now = new Date().getHours();
  const offset = 2;

  const forecast = json.features[0].properties.parameters[parameter].data;

  const units = {
    t2m: "°C",
    rr_acc: "mm",
  };
  const unit = units[parameter] ?? "";

  for (let i = offset; i < 8; i++) {
    console.log(`${(now + i) % 24} → ${forecast[i].toFixed(0)} ${unit}<br>`);
  }
}

async function main() {
  const pos = await getCoordinates();
  const coordinates = `${pos.coords.latitude},${pos.coords.longitude}`;

  console.log(`Koordinaten: ${coordinates}`);

  await getweather("t2m", coordinates);
  await getweather("rr_acc", coordinates);
}

main();
