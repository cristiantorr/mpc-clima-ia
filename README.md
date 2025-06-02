# Weather MCP Service

Este es un servicio de Model Context Protocol (MCP) que proporciona información del clima en tiempo real para diferentes ciudades alrededor del mundo.

## Descripción

El servicio utiliza la API de Open-Meteo para obtener datos meteorológicos precisos y actualizados. Permite consultar la temperatura actual y las condiciones climáticas de cualquier ciudad.

## Características

- Consulta de temperatura en tiempo real.
- Descripción del estado del clima.
- Soporte para búsqueda de ciudades a nivel mundial.
- Interfaz simple y fácil de usar.

## Tecnologías utilizadas

- Node.js
- TypeScript
- Model Context Protocol (MCP)
- Open-Meteo API

## Instalación

1. Clona este repositorio.
2. Instala las dependencias:
```bash
npm install
```

## Uso

Para iniciar el servidor MCP:

```bash
npx tsx main.ts
```

### Ejemplo de uso

El servicio responde a consultas sobre el clima en cualquier ciudad. Por ejemplo:

```typescript
// Ejemplo de consulta
const response = await fetchWeather("Madrid");
// Respuesta: "El clima en Madrid: 22°C, soleado"
```

## APIs utilizadas

- [Open-Meteo Geocoding API](https://geocoding-api.open-meteo.com) - Para convertir nombres de ciudades en coordenadas
- [Open-Meteo Weather API](https://api.open-meteo.com) - Para obtener datos meteorológicos

## Estructura del proyecto

```
01-start/
├── main.ts         # Archivo principal del servidor MCP
└── README.md       # Esta documentación
```

## Licencia

MIT

