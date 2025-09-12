// === ENDPOINTS de tiles (TileServer-GL en 8091) ===
const T_BASE = 'http://localhost:8080/data';
const URLS = {
  playa_brava:         `${T_BASE}/playa_brava/{z}/{x}/{y}.pbf`,
  pinar_del_faro:      `${T_BASE}/pinar_del_faro/{z}/{x}/{y}.pbf`,
  chacras_joseignacio: `${T_BASE}/chacras_joseignacio/{z}/{x}/{y}.pbf`,
};

// === Estilo (MapLibre/Mapbox Style Spec) con 3 fuentes y 6 capas (relleno + borde) ===
const myVectorStyle = {
  version: 8,
  sources: {
    'src-playa':  { type: 'vector', tiles: [URLS.playa_brava],         minzoom: 5, maxzoom: 22 },
    'src-pinar':  { type: 'vector', tiles: [URLS.pinar_del_faro],      minzoom: 5, maxzoom: 22 },
    'src-chacras':{ type: 'vector', tiles: [URLS.chacras_joseignacio], minzoom: 5, maxzoom: 22 }
  },
  layers: [
    // --- Playa Brava ---
    {
      id: 'fill-playa',
      type: 'fill',
      source: 'src-playa',
      'source-layer': 'playa_brava',   // asegura que coincida con el -l de tippecanoe
      paint: { 'fill-color': '#ff0000', 'fill-opacity': 0.75 }
    },
    {
      id: 'line-playa',
      type: 'line',
      source: 'src-playa',
      'source-layer': 'playa_brava',
      paint: { 'line-color': '#ffffff', 'line-width': 1.5 }
    },

    // --- Pinar del Faro ---
    {
      id: 'fill-pinar',
      type: 'fill',
      source: 'src-pinar',
      'source-layer': 'pinar_del_faro', // idem, debe coincidir con el nombre interno
      paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.2 } // verde
    },
    {
      id: 'line-pinar',
      type: 'line',
      source: 'src-pinar',
      'source-layer': 'pinar_del_faro',
      paint: { 'line-color': '#ffffff', 'line-width': 1.5 }
    },

    // --- Chacras José Ignacio ---
    {
      id: 'fill-chacras',
      type: 'fill',
      source: 'src-chacras',
      'source-layer': 'chacras_joseignacio',
      paint: { 'fill-color': '#1e40af', 'fill-opacity': 0.65 } // azul
    },
    {
      id: 'line-chacras',
      type: 'line',
      source: 'src-chacras',
      'source-layer': 'chacras_joseignacio',
      paint: { 'line-color': '#ffffff', 'line-width': 1.5 }
    }
  ]
};

// === Leaflet map base ===
const map = L.map('map').setView([-34.82602, -54.64395], 14);

// Pane para asegurar vector arriba del ráster
map.createPane('gl-pane');
map.getPane('gl-pane').style.zIndex = 650;
map.getPane('gl-pane').style.pointerEvents = 'auto';

// Capa base Esri (abajo)
L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { attribution: 'Tiles &copy; Esri' }
).addTo(map);

// Vector tiles (arriba)
const vectorLayer = L.maplibreGL({ style: myVectorStyle, pane: 'gl-pane' }).addTo(map);
const glMap = vectorLayer.getMaplibreMap ? vectorLayer.getMaplibreMap() : vectorLayer._glMap;

// === Helpers de visibilidad ===
const GROUPS = {
  playa:   ['fill-playa','line-playa'],
  pinar:   ['fill-pinar','line-pinar'],
  chacras: ['fill-chacras','line-chacras'],
};

function setVisibility(layerId, visible) {
  if (!glMap) return;
  const layer = glMap.getStyle().layers.find(l => l.id === layerId);
  if (!layer) return;
  glMap.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
}

function showOnly(groupKey) {
  Object.keys(GROUPS).forEach(key => {
    const isTarget = key === groupKey;
    GROUPS[key].forEach(id => setVisibility(id, isTarget));
  });
}

function showAll() {
  Object.values(GROUPS).flat().forEach(id => setVisibility(id, true));
}

function hideAll() {
  Object.values(GROUPS).flat().forEach(id => setVisibility(id, false));
}

// Ejemplos de uso (podés colgarlos de botones en tu sidebar):
// showOnly('playa'); showOnly('pinar'); showOnly('chacras'); showAll(); hideAll();

// (Opcional) centrar por barrio con coords aproximadas
const centros = {
  playa:   [-34.82602, -54.64395],
  pinar:   [-34.8860, -54.9300],
  chacras: [-34.7970, -54.6150]
};
function centrar(groupKey, zoom=15) {
  const c = centros[groupKey];
  if (c) map.setView(c, zoom);
}

// Click: ejemplo genérico (si querés identificar y abrir popup de lo que esté arriba)
map.on('click', (e) => {
  if (!glMap) return;
  const pt = map.latLngToContainerPoint(e.latlng);
  // Consultamos todas las capas de fill en orden
  const layersOrder = ['fill-playa','fill-pinar','fill-chacras'];
  const features = glMap.queryRenderedFeatures([pt.x, pt.y], { layers: layersOrder });
  if (!features || !features.length) return;

  const f = features[0];
  const id = f.properties?.id_unica ?? f.properties?.id ?? '(sin id)';
  L.popup()
    .setLatLng(e.latlng)
    .setContent(`<b>Layer:</b> ${f.layer?.id}<br><b>ID:</b> ${id}`)
    .openOn(map);
});
