import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: 'Weather Service',
  version: '1.1.0',
})

server.tool(
  '590_my-weather-tool',
  'Consulta detallada del clima en una ciudad',
  {
    city: z.string().describe('City name'),
  },
  async ({ city }) => {
    try {
        // Obtenemos las coordenadas de la ciudad
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=es&format=json`);
        const geoData = await geoResponse.json();
       
        if(!geoData.results || geoData.results.length === 0) {
            return `No se encontró la ciudad ${city}`;
        }

        const location = geoData.results[0];
        
        // Obtenemos datos meteorológicos detallados
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?` +
            `latitude=${location.latitude}&longitude=${location.longitude}&` +
            `current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,` +
            `weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,is_day&` +
            `daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&` +
            `timezone=auto`
        );
        const weatherData = await weatherResponse.json();

        // Mapeo de códigos de clima a descripciones en español
        const weatherCodes = {
            0: "Despejado",
            1: "Mayormente despejado",
            2: "Parcialmente nublado",
            3: "Nublado",
            45: "Niebla",
            48: "Niebla con escarcha",
            51: "Llovizna ligera",
            53: "Llovizna moderada",
            55: "Llovizna intensa",
            61: "Lluvia ligera",
            63: "Lluvia moderada",
            65: "Lluvia fuerte",
            71: "Nevada ligera",
            73: "Nevada moderada",
            75: "Nevada fuerte",
            77: "Aguanieve",
            80: "Lluvia ligera intermitente",
            81: "Lluvia moderada intermitente",
            82: "Lluvia fuerte intermitente",
            85: "Nevada ligera intermitente",
            86: "Nevada fuerte intermitente",
            95: "Tormenta eléctrica",
            96: "Tormenta eléctrica con granizo ligero",
            99: "Tormenta eléctrica con granizo fuerte"
        };

        const current = weatherData.current;
        const daily = weatherData.daily;
        const weatherDescription = weatherCodes[current.weather_code] || "Desconocido";

        // Convertimos la dirección del viento a punto cardinal
        const windDirection = () => {
            const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
            const index = Math.round(current.wind_direction_10m / 22.5) % 16;
            return directions[index];
        };

        return `📍 Reporte meteorológico detallado para ${city}:

🌡️ CONDICIONES ACTUALES:
   Temperatura: ${current.temperature_2m}°C
   Sensación térmica: ${current.apparent_temperature}°C
   Humedad relativa: ${current.relative_humidity_2m}%
   Estado del cielo: ${weatherDescription}

🌧️ PRECIPITACIÓN:
   Actual: ${current.precipitation}mm
   Probabilidad máxima hoy: ${daily.precipitation_probability_max[0]}%

💨 VIENTO:
   Velocidad: ${current.wind_speed_10m} km/h
   Dirección: ${windDirection()} (${current.wind_direction_10m}°)

📊 PRESIÓN ATMOSFÉRICA:
   ${current.pressure_msl} hPa

🌡️ TEMPERATURAS HOY:
   Máxima: ${daily.temperature_2m_max[0]}°C
   Mínima: ${daily.temperature_2m_min[0]}°C

📍 UBICACIÓN:
   Latitud: ${location.latitude}°
   Longitud: ${location.longitude}°
   Elevación: ${location.elevation}m
   País: ${location.country || 'No disponible'}
   
⏰ Última actualización: ${new Date(current.time).toLocaleString()}`;
    } catch (error) {
        return `Error al obtener el clima para ${city}: ${error.message}`;
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);


