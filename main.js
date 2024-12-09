import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30; 

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Declare cube globally
let cube;

// Get the last three digits of Student ID and calculate ambient intensity
const nrp = "5025221239";  
const lastThreeDigits = parseInt(nrp.slice(-3));  // Get the last three digits
const ambientIntensityValue = (lastThreeDigits + 200) / 1000.0;  // Calculate ambient intensity

const sharedUniforms = {
    lightPosition: { value: new THREE.Vector3(0, 0, 0) },  
    ambientIntensity: { value: ambientIntensityValue },  
    viewPosition: { value: camera.position }  
};

// Load font and create geometries for the text
const loader = new FontLoader();
loader.load('assets/fonts/helvetiker_regular.typeface.json', function (font) {
    const name = "DaniS";  // Name or nrp (used to extract the last character)
    const nrp = "5025221239";  

    const lastChar = name.slice(-1);  // Get the last character of the name or nrp
    const lastDigit = nrp.slice(-1);  

    // Alphabet material (plastic-like specular highlight)
    const alphabetMaterial = new THREE.ShaderMaterial({
        uniforms: {
            ...sharedUniforms,
            baseColor: { value: new THREE.Color(0x0e0e0e) },  // Color for the alphabet (from Assignment 1)
            shininess: { value: 16.0 }  
        },
        vertexShader: ` 
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vNormal = normalMatrix * normal;
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 lightPosition;
            uniform float ambientIntensity;
            uniform vec3 baseColor;
            uniform vec3 viewPosition;
            uniform float shininess;

            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 lightDir = normalize(lightPosition - vPosition);
                vec3 viewDir = normalize(viewPosition - vPosition);
                vec3 halfDir = normalize(lightDir + viewDir);

                vec3 ambient = baseColor * ambientIntensity;
                float diff = max(dot(normal, lightDir), 0.0);
                vec3 diffuse = diff * baseColor;
                float spec = pow(max(dot(normal, halfDir), 0.0), shininess);
                vec3 specular = spec * vec3(1.0);

                vec3 result = ambient + diffuse + specular;
                gl_FragColor = vec4(result, 1.0);
            }
        `,
    });

    // Create text geometry for the alphabet
    const charGeometry = new TextGeometry(lastChar, {
        font: font,
        size: 5,
        height: 1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.5,
        bevelSize: 0.3,
        bevelOffset: 0,
        bevelSegments: 5
    });
    const charMesh = new THREE.Mesh(charGeometry, alphabetMaterial);
    charMesh.position.set(-10, 0, 0);  
    scene.add(charMesh);

    // Digit material (metal-like specular highlight)
    const digitMaterial = new THREE.ShaderMaterial({
        uniforms: {
            ...sharedUniforms,
            baseColor: { value: new THREE.Color(0xf1f1f1) },  // Complementary color for the digit
            shininess: { value: 128.0 }  
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vNormal = normalMatrix * normal;
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 lightPosition;
            uniform float ambientIntensity;
            uniform vec3 baseColor;
            uniform vec3 viewPosition;
            uniform float shininess;

            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 lightDir = normalize(lightPosition - vPosition);
                vec3 viewDir = normalize(viewPosition - vPosition);
                vec3 halfDir = normalize(lightDir + viewDir);

                vec3 ambient = baseColor * ambientIntensity;
                float diff = max(dot(normal, lightDir), 0.0);
                vec3 diffuse = diff * baseColor;
                float spec = pow(max(dot(normal, halfDir), 0.0), shininess);
                vec3 specular = spec * baseColor;

                vec3 result = ambient + diffuse + specular;
                gl_FragColor = vec4(result, 1.0);
            }
        `,
    });

    // Create text geometry for the digit
    const digitGeometry = new TextGeometry(lastDigit, {
        font: font,
        size: 5,
        height: 1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.5,
        bevelSize: 0.3,
        bevelOffset: 0,
        bevelSegments: 5
    });
    const digitMesh = new THREE.Mesh(digitGeometry, digitMaterial);
    digitMesh.position.set(10, 0, 0);  
    scene.add(digitMesh);

    // Create central glowing cube
    const cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
    const cubeMaterial = new THREE.ShaderMaterial({
        uniforms: {
            glowColor: { type: 'c', value: new THREE.Color(0xffffff) },
            viewVector: { type: 'v3', value: camera.position },
            time: { type: 'f', value: 0.0 },
            ambientLight: { value: 0.5 },
            metalness: { value: 0.95 },
            roughness: { value: 0.05 }
        },
        vertexShader: `
            uniform vec3 viewVector;
            varying vec3 vNormal;
            varying float intensity;
            varying vec3 vViewDir;

            void main() {
                vNormal = normalize(normalMatrix * normal);
                vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                vViewDir = normalize(viewVector - worldPosition);
                intensity = pow(1.0 - dot(vNormal, normalize(viewVector)), 3.0);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 glowColor;
            uniform float time;
            uniform float ambientLight;
            uniform float metalness;
            uniform float roughness;

            varying vec3 vNormal;
            varying vec3 vViewDir;
            varying float intensity;
            void main() {
                float pulseFactor = 1.0 + 0.5 * sin(time * 2.0);  // Increased pulse amplitude
                float fresnelFactor = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);  // Decreased power for stronger effect

                vec3 reflection = reflect(-vViewDir, vNormal);
                float specIntensity = pow(max(dot(reflection, vViewDir), 0.0), 16.0);  // Decreased for broader highlights

                vec3 metalColor = mix(glowColor, vec3(1.0), metalness);
                vec3 specular = metalColor * specIntensity * (1.0 - roughness) * 2.0;  // Doubled specular
                vec3 glow = metalColor * intensity * pulseFactor * 3.0;  // Increased glow multiplier

                vec3 finalColor = glow + specular + (fresnelFactor * metalColor * 0.8);  // Increased fresnel contribution
                finalColor += ambientLight * metalColor;

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
    });

    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0, 0);  
    scene.add(cube);

    // Add point light to simulate the cube glowing
    const pointLight = new THREE.PointLight(0xffffff, 3, 50);
    pointLight.position.set(0, 0, 0);  
    scene.add(pointLight);

    // Keyboard controls for interactivity
    const controls = {
        moveCubeUp: false,
        moveCubeDown: false,
        moveCameraLeft: false,
        moveCameraRight: false
    };

    window.addEventListener('keydown', (event) => {
        if (event.key === 'w') controls.moveCubeUp = true;
        if (event.key === 's') controls.moveCubeDown = true;
        if (event.key === 'a') controls.moveCameraLeft = true;
        if (event.key === 'd') controls.moveCameraRight = true;
    });

    window.addEventListener('keyup', (event) => {
        if (event.key === 'w') controls.moveCubeUp = false;
        if (event.key === 's') controls.moveCubeDown = false;
        if (event.key === 'a') controls.moveCameraLeft = false;
        if (event.key === 'd') controls.moveCameraRight = false;
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        if (cube) {
            cube.material.uniforms.time.value += 0.016;  // Update cube's time for glowing effect
            cube.rotation.x += 0.005;  // Rotate the cube
            cube.rotation.y += 0.005;  

            // Update light position for text materials
            const lightPos = cube.position;
            scene.traverse((object) => {
                if (object.material && object.material.uniforms && object.material.uniforms.lightPosition) {
                    object.material.uniforms.lightPosition.value.copy(lightPos);
                }
            });

            // Move cube up/down
            if (controls.moveCubeUp) cube.position.y += 0.1;
            if (controls.moveCubeDown) cube.position.y -= 0.1;

            // Move camera left/right
            if (controls.moveCameraLeft) camera.position.x -= 0.1;
            if (controls.moveCameraRight) camera.position.x += 0.1;
        }

        renderer.render(scene, camera);  
    }
    animate();
});

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);  // Adjust renderer size on window resize
});
