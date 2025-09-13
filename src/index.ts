import { Loader } from '@googlemaps/js-api-loader';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Map configuration
const MAP_ID = 'YOUR_MAP_ID'; // <-- Replace with your Map ID
const URL_DEL_MODELO_GLB = new URL('../renders/6 casas.glb', import.meta.url).href;

// Four corners of the lot
const coordenadasTerreno = [
  { lat: -34.8052, lng: -54.7170 }, // Top-left
  { lat: -34.8052, lng: -54.7165 }, // Top-right
  { lat: -34.8055, lng: -54.7165 }, // Bottom-right
  { lat: -34.8055, lng: -54.7170 }, // Bottom-left
];

function getCentro(coords: google.maps.LatLngLiteral[]): google.maps.LatLngLiteral {
  const sum = coords.reduce((acc, cur) => ({ lat: acc.lat + cur.lat, lng: acc.lng + cur.lng }), { lat: 0, lng: 0 });
  return { lat: sum.lat / coords.length, lng: sum.lng / coords.length };
}

function getRotacion(coords: google.maps.LatLngLiteral[]): number {
  const [tl, tr] = coords;
  return Math.atan2(tr.lat - tl.lat, tr.lng - tl.lng);
}

async function initMap() {
  const loader = new Loader({
    apiKey: process.env.API_KEY,
    version: 'beta',
    mapIds: [MAP_ID],
  });
  await loader.load();

  const centro = getCentro(coordenadasTerreno);
  const map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
    mapId: MAP_ID,
    center: centro,
    zoom: 20,
    tilt: 67.5,
    heading: 0,
  });

  const overlay = new google.maps.WebGLOverlayView();
  let scene: THREE.Scene;
  let renderer: THREE.WebGLRenderer;
  let camera: THREE.Camera;

  overlay.onAdd = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera();
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(URL_DEL_MODELO_GLB, (gltf) => {
      const modelo = gltf.scene;
      modelo.rotation.x = Math.PI / 2;
      modelo.rotation.z = getRotacion(coordenadasTerreno);
      scene.add(modelo);
    });
  };

  overlay.onContextRestored = ({ gl }) => {
    renderer = new THREE.WebGLRenderer({ canvas: gl.canvas, context: gl });
    renderer.autoClear = false;
  };

  overlay.onDraw = ({ gl, transformer }) => {
    if (!scene || !camera) return;
    const matrix = transformer.fromLatLngAltitude(centro);
    camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix); // position model
    overlay.requestRedraw();
    renderer.render(scene, camera);
    renderer.resetState();
  };

  overlay.setMap(map);
}

initMap();
