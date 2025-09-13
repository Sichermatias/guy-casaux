# 3D Real Estate on Google Maps

Prueba inicial basada en el documento `renders/Gmail - 3D Real Estate on Google Maps.pdf`.

## Requisitos

- [Node.js](https://nodejs.org/) 20+
- Una clave de API de Google Maps habilitada para **Maps JavaScript API**
- Un **Map ID** de tipo *Vector*
- URL pública de un modelo `glb` (se incluye `renders/6 casas.glb` como ejemplo)

## Configuración

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Exportar la variable de entorno con la clave de API:
   ```bash
   export API_KEY="TU_API_KEY"
   ```
   También podés crear un archivo `.env` con `API_KEY=TU_API_KEY`.
3. Reemplazar en `src/index.ts`:
   - `MAP_ID` por tu Map ID.
   - `URL_DEL_MODELO_GLB` por la URL pública de tu modelo.
   - `coordenadasTerreno` por las cuatro esquinas de tu terreno.

## Ejecutar

Para levantar el entorno de desarrollo:
```bash
npm run dev
```

Abrí `http://localhost:5173` y se cargará el mapa con el modelo 3D.

## Próximos pasos

- Ajustar la rotación, escala y posicionamiento del modelo según el terreno real.
- Implementar carga dinámica de coordenadas y modelos desde un backend.
- Agregar controles de UI para seleccionar distintos lotes o modelos.
- Preparar la versión de producción con `npm run build`.
