import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 1. Crear el servidor
// Es la interfaz principal con el procotolo MCP. Maneja la comunicación entre el cliente y el servidor.

const server = new McpServer({
  name: "Weather Service",
  version: "1.1.0",
});

// 2. Definir las herramientas
// Las herramientas le permite al LLM realizar acciones a través de tu servidor.

server.tool(
  "my-weather-tool",
  "Estamos Averiguando el clima en una ciudad",
  {
    city: z.string().describe("City name"),
  },

  async ({ city }) => {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=es&format=json`
      );
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No se encontró la ciudad ${city}`,
            },
          ],
        };
      }

      const { latitude, longitude } = data.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,precipitation,is_day,rain&timezone=auto`
      );
      const weatherData = await weatherResponse.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(weatherData),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error al obtener el clima para ${city}: ${error.message}`,
          },
        ],
      };
    }
  }
);

// 3. Conectar el servidor a la entrada y salida estándar
// Esto permite que el servidor escuche las peticiones y envíe respuestas a través de la consola.
const transport = new StdioServerTransport();
await server.connect(transport);
