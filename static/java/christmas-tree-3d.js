
import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.150.1/examples/jsm/loaders/GLTFLoader.js';

function initChristmasTree() {
    console.log("Initialisation du sapin 3D (Position Gauche, Fixe)...");

    try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        renderer.domElement.style.position = 'fixed';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.zIndex = '1';
        renderer.domElement.style.pointerEvents = 'none';

        document.body.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 2);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffd700, 2);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        const loader = new GLTFLoader();

        loader.load('./sapin_noel__christmas_tree.glb', (gltf) => {
            console.log("Modèle GLB chargé avec succès !");
            const tree = gltf.scene;

            // POSITION GAUCHE
            tree.position.set(window.innerWidth > 768 ? -2 : -1, -1, 0);
            tree.scale.set(0.8, 0.8, 0.8);

            scene.add(tree);

            // AFFICHAGE UNIQUE (PAS DE ROTATION)
            renderer.render(scene, camera);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% chargé');
        },
        (error) => {
            console.error('Erreur chargement GLB :', error);
        });

        camera.position.z = 5;

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            // On rerend pour le resize
            renderer.render(scene, camera);
        });
    } catch (e) {
        console.error("Erreur Three.js :", e);
    }
}

initChristmasTree();
