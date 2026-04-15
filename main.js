"use strict";
function getCoordinates() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function getweather(parameter, coordinates) {
  /**
   * Läd die Wetterdaten für die angegebenen Koordinaten.
   * Koordinaten werden berechnet via https://epsg.io/4326
   * OpenAPI-Doku für den Mode forecast: https://dataset.api.hub.geosphere.at/v1/openapi-docs#/forecast/Timeseries_Forecast_timeseries_forecast__resource_id__get
   * @param {string} Welche Wetter-Parameter das API liefern soll.
   */

  const url = `https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/nwp-v1-1h-2500m?parameters=${parameter}&lat_lon=${coordinates}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geosphere API Error: ${res.status}`);
  }
  const json = await res.json();

  // get forcast from JSON
  const forecast = json.features[0].properties.parameters[parameter].data;

  return forecast;
}

function printtoscreen(t2m_forecast, rr_acc_forecast) {
  // set timezone
  const now = new Date();
  const hours = new Date().getHours();
  const timezone = Math.abs(now.getTimezoneOffset() / 60);
  console.log(`Timezone offset: ${timezone}`);

  const grid = document.querySelector("#forecast");

  for (let i = timezone; i < 8; i++) {
    console.log(`${(hours + i) % 24} → ${t2m_forecast[i].toFixed(0)}`);
    console.log(`${(hours + i) % 24} → ${rr_acc_forecast[i].toFixed(0)}`);

    const row = document.createElement("div");
    // FIXME: hier gehören noch die wforecast-Elemente rein
    row.className = "row";
    row.innerHTML = `
        <div class="time">${(hours + i) % 24}h</div>
        <div class="temp">${t2m_forecast[i].toFixed(0)} °C</div>
        <div class="icon" aria-label="Bewölkung">--</div>
        <div class="rain">${rr_acc_forecast[i].toFixed(0)} mm</div>
      `;
    grid.append(row);
  }
}

async function main() {

  const pos = await getCoordinates();
  const coordinates = `${pos.coords.latitude},${pos.coords.longitude}`;

  console.log(`Koordinaten: ${coordinates}`);

  let t2m_forecast = await getweather("t2m", coordinates);
  let rr_acc_forecast = await getweather("rr_acc", coordinates);

  printtoscreen(t2m_forecast, rr_acc_forecast);
}

main();
