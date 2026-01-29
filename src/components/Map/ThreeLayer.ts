import maplibregl from 'maplibre-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { IFCLoader } from 'three/examples/jsm/loaders/IFCLoader.js';

export class ThreeLayer {
    public id: string = '3d-model';
    public type: 'custom' = 'custom';
    public renderingMode: '3d' = '3d';

    private map: maplibregl.Map | null = null;
    private camera: THREE.Camera;
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer | null = null;
    public modelCoordinate: maplibregl.LngLatLike;
    private debugCube: THREE.Mesh | null = null;

    constructor(modelCoordinate: maplibregl.LngLatLike) {
        this.modelCoordinate = modelCoordinate;
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();

        // LIGHTS
        const ambient = new THREE.AmbientLight(0xffffff, 2.0);
        this.scene.add(ambient);
        const sun = new THREE.DirectionalLight(0xffffff, 3.0);
        sun.position.set(0, 0, 1000); // Z is up in MapLibre usually
        this.scene.add(sun);

        // --- PERSISTENT DEBUG CUBE (AUTO-SPAWN) ---
        // We calculate position later in onAdd or manually here?
        // We need 'map' or 'MercatorCoordinate' static.
        const center = maplibregl.LngLat.convert(this.modelCoordinate);
        const merc = maplibregl.MercatorCoordinate.fromLngLat(center, 0);
        const scale = merc.meterInMercatorCoordinateUnits() * 300; // 300m Box

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00, // NEON GREEN
            wireframe: false,
            side: THREE.DoubleSide
        });
        this.debugCube = new THREE.Mesh(geometry, material);

        this.debugCube.position.set(merc.x, merc.y, merc.z);
        this.debugCube.scale.set(scale, scale, scale * 3); // Tall tower

        console.log(`[ThreeLayer] Persistent Cube Created at:`, merc);

        this.scene.add(this.debugCube);

        // LISTENERS
        window.addEventListener('spawn-galpon-on-map', this.handleSpawnGalpon);
    }

    private handleSpawnGalpon = () => {
        // Reduntant if we have persistent cube, but let's change color
        if (this.debugCube) {
            (this.debugCube.material as THREE.MeshBasicMaterial).color.setHex(0xff0000); // Turn RED
            console.log("[ThreeLayer] Event Received! Cube turned RED.");
        }
    }

    public async loadModel(file: File) {
        console.log(`[ThreeLayer] Loading model: ${file.name}`);
        const url = URL.createObjectURL(file);
        const extension = file.name.split('.').pop()?.toLowerCase();

        if (extension === 'ifc') {
            // await this.loadIFC(url);
            alert("IFC Loader temporarily disabled. Requires 'web-ifc-three'.");
        } else if (extension === 'glb' || extension === 'gltf') {
            await this.loadGLTF(url);
        } else {
            alert('Unsupported format. Please use .ifc, .glb, or .gltf');
        }
    }

    /*
    private async loadIFC(url: string) {
        const ifcLoader = new IFCLoader();
        // Setup WASM path - using unpkg as fallback if local copy missing
        // In production this should be served from public/
        ifcLoader.ifcManager.setWasmPath('https://unpkg.com/web-ifc@0.0.74/'); 
        
        try {
            const model = await ifcLoader.loadAsync(url);
            this.addToScene(model);
        } catch (e) {
            console.error("IFC Load Error:", e);
            alert("Error loading IFC. Check console.");
        }
    }
    */

    private async loadGLTF(url: string) {
        const loader = new GLTFLoader();
        try {
            const gltf = await loader.loadAsync(url);
            this.addToScene(gltf.scene);
        } catch (e) {
            console.error("GLTF Load Error:", e);
            alert("Error loading GLTF. Check console.");
        }
    }

    private addToScene(object: THREE.Object3D) {
        console.log("[ThreeLayer] Object added to scene", object);

        // Convert Map Coordinate to World World
        const center = maplibregl.LngLat.convert(this.modelCoordinate);
        const merc = maplibregl.MercatorCoordinate.fromLngLat(center, 0);
        const scale = merc.meterInMercatorCoordinateUnits();

        // Normalize Scale (IFC often in meters)
        object.position.set(merc.x, merc.y, merc.z);
        object.scale.set(scale, scale, scale); // 1 unit = 1 meter usually

        // Auto-Rotate upright if needed (IFC/GLTF often Y-up, MapLibre Z-up)
        // object.rotation.x = Math.PI / 2; 

        this.scene.add(object);

        // Remove debug cube if successful
        if (this.debugCube) {
            this.scene.remove(this.debugCube);
            this.debugCube = null;
        }

        this.map?.triggerRepaint();
    }

    onAdd(map: maplibregl.Map, gl: WebGLRenderingContext) {
        this.map = map;
        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true,
        });
        this.renderer.autoClear = false;
        console.log("[ThreeLayer] Renderer Attached.");
    }

    render(gl: WebGLRenderingContext, matrix: number[]) {
        if (!this.map || !this.renderer) return;

        // ANIMATE
        if (this.debugCube) {
            this.debugCube.rotation.z += 0.05; // Spin
        }

        // SYNC CAMERA
        const m = new THREE.Matrix4().fromArray(matrix);
        this.camera.projectionMatrix = m;

        // DRAW
        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
    }
}
