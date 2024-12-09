import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0xadd8e6);

camera.position.z = 5;

const loader = new FontLoader();
loader.load('assets/fonts/helvetiker_regular.typeface.json', function (font) {
    const name = "Danis";
    const studentID = "5025221239";

    const lastChar = name.slice(-1);
    const lastDigit = studentID.slice(-1);

    const alphabetMaterial = new THREE.MeshBasicMaterial({ color: 0x0e0e0e });
    const digitMaterial = new THREE.MeshBasicMaterial({ color: 0xf1f1f1 });

    const charGeometry = new TextGeometry(lastChar, {
        font: font,
        size: 1,
        height: 0.2,
    });
    const charMesh = new THREE.Mesh(charGeometry, alphabetMaterial);
    charMesh.position.x = -2;
    scene.add(charMesh);

    const digitGeometry = new TextGeometry(lastDigit, {
        font: font,
        size: 1,
        height: 0.2,
    });
    const digitMesh = new THREE.Mesh(digitGeometry, digitMaterial);
    digitMesh.position.x = 2;
    scene.add(digitMesh);

    const glowVertexShader = `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const glowFragmentShader = `
        varying vec3 vNormal;
        void main() {
            float intensity = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0) * intensity;
        }
    `;

    const glowMaterial = new THREE.ShaderMaterial({
        vertexShader: glowVertexShader,
        fragmentShader: glowFragmentShader,
        side: THREE.FrontSide,
        transparent: true,
    });

    const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const glowingCube = new THREE.Mesh(cubeGeometry, glowMaterial);
    glowingCube.position.set(0, 0, 0);
    scene.add(glowingCube);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    const smallCubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const smallCubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const smallCube = new THREE.Mesh(smallCubeGeometry, smallCubeMaterial);
    smallCube.position.set(0, 0, 0);
    scene.add(smallCube);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
});
