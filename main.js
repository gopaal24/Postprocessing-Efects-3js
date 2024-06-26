import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { FilmPass } from "three/addons/postprocessing/FilmPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RenderPixelatedPass } from "three/addons/postprocessing/RenderPixelatedPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { TAARenderPass } from "three/addons/postprocessing/TAARenderPass.js";

import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { HueSaturationShader } from "three/addons/shaders/HueSaturationShader.js";
import { BrightnessContrastShader } from "three/addons/shaders/BrightnessContrastShader.js";
import { VignetteShader } from "three/addons/shaders/VignetteShader.js";
import { DOFMipMapShader } from "three/addons/shaders/DOFMipMapShader.js";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";
import { RGBShiftShader } from "three/addons/shaders/RGBShiftShader.js";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(0, 0, 35);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcc33ff);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMapSoft = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.type = THREE.VSMShadowMap; // Soft shadows
document.body.appendChild(renderer.domElement);

const hdrLoader = new RGBELoader();
hdrLoader.load("./satara_night_4k.hdr", function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  // scene.background = texture;
});

const loader = new GLTFLoader();
var model;
loader.load("./model.gltf", function (gltf) {
  model = gltf.scene;

  model.traverse(function (node) {
    if (node.isMesh) {
      
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  // scene.add(model);
});

const controls = new OrbitControls(camera, renderer.domElement);

const renderPass = new RenderPass(scene, camera);

const composer = new EffectComposer(renderer);
composer.addPass(renderPass);

const ambient = new THREE.AmbientLight();
ambient.intensity = 2;
scene.add(ambient);

const shadowLight = new THREE.DirectionalLight(0xffffff, 0.5);
shadowLight.position.set(5, 20, 0);
shadowLight.castShadow = true;
shadowLight.shadowCameraVisible = true;
shadowLight.shadowDarkness = 1;
shadowLight.shadow.camera.left = -50;
shadowLight.shadow.camera.right = 50;
shadowLight.shadow.camera.top = 50;
shadowLight.shadow.camera.bottom = -50;
shadowLight.shadow.camera.near = 1;
shadowLight.shadow.camera.far = 50;
shadowLight.shadowCameraVisible = true;
shadowLight.shadow.mapSize.width = 2048; // default is 512
shadowLight.shadow.mapSize.height = 2048;
shadowLight.shadow.normalBias = 0.05;
shadowLight.shadow.radius = 10;
scene.add(shadowLight);

const DirectionalLight = new THREE.DirectionalLight(0xffffff, 1);
DirectionalLight.position.set(5, 20, 0);
// DirectionalLight.castShadow = true;
// DirectionalLight.shadowCameraVisible = true;
scene.add(DirectionalLight);

const pointLight = new THREE.PointLight(0xffffff, 5);
pointLight.position.set(0, 3, 0);
pointLight.castShadow = true;
// scene.add(pointLight);

const spotLight = new THREE.SpotLight(0xffffff, 10);
spotLight.position.set(5, 2, 0);
// spotLight.castShadow = true;
spotLight.angle = Math.PI / 6;
// scene.add(spotLight);

let color_ = 0xff0000,
  size = 20.0,
  thickness = 0.5;

const group2 = new THREE.Group();
const halfSize = size * 0.5;

const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(thickness, size + thickness, thickness),
  new THREE.MeshBasicMaterial({ color_ })
);

const clone0 = group2.clone();

let clone = mesh.clone();
clone.position.set(-halfSize, 0, halfSize);
clone0.add(clone);

clone = mesh.clone();
clone.position.set(halfSize, 0, halfSize);
clone0.add(clone);

clone = mesh.clone();
clone.position.set(-halfSize, 0, -halfSize);
clone0.add(clone);

clone = mesh.clone();
clone.position.set(halfSize, 0, -halfSize);
clone0.add(clone);

const clone1 = clone0.clone();
clone1.rotation.set(Math.PI / 2, 0, 0);

const clone2 = clone0.clone();
clone2.rotation.set(0, 0, Math.PI / 2);

group2.add(clone0);
group2.add(clone1);
group2.add(clone2);
scene.add(group2);

const group = new THREE.Group();
const PI2 = 2 * Math.PI;

const geometries = [
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.ConeGeometry(1, 1, 16),
  new THREE.OctahedronGeometry(),
  new THREE.SphereGeometry(1, 16, 16),
];

let amount = 30,
  range = 10.0;

for (let i = 0, j = 0, l = geometries.length; i < amount; ++i, j = ++j % l) {
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff * Math.random(),
  });

  const mesh = new THREE.Mesh(geometries[j], material);
  mesh.rotation.set(
    Math.random() * PI2,
    Math.random() * PI2,
    Math.random() * PI2
  );
  mesh.scale.multiplyScalar(Math.random() + 0.75);

  const phi = Math.random() * PI2;
  const cosTheta = Math.random() * 2.0 - 1.0;
  const u = Math.random();

  const theta = Math.acos(cosTheta);
  const r = Math.cbrt(u) * range;

  mesh.position.set(
    r * Math.sin(theta) * Math.cos(phi),
    r * Math.sin(theta) * Math.sin(phi),
    r * Math.cos(theta)
  );

  group.add(mesh);
}

scene.add(group);

//DepthOfField
const Dof = new BokehPass(scene, camera, {
  focus: 1.0,
  aperture: 0.025,
  maxblur: 0.01,
  width: window.innerWidth,
  height: window.innerHeight,
});
// Dof.renderToScreen = true;
Dof.enabled = false;
composer.addPass(Dof);
console.log(Dof)

//Pixelation
const renderPixelatedPass = new RenderPixelatedPass(6, scene, camera);
renderPixelatedPass.enabled = false;
composer.addPass(renderPixelatedPass);
console.log(renderPixelatedPass)

//Hue Saturation
const HueSaturationPass = new ShaderPass(HueSaturationShader);
HueSaturationPass.enabled = false;
console.log(HueSaturationPass);
composer.addPass(HueSaturationPass);

//Bloom Effect
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0,
  1,
  0.85
);
bloomPass.enabled = false; 
bloomPass.threshold = 0.3;
bloomPass.strength = 0.6;
bloomPass.radius = 0.5;
bloomPass.highPassUniforms["smoothWidth"].value = 0;
composer.addPass(bloomPass);

//Brightness Contrast
const BrightnessContrast = new ShaderPass(BrightnessContrastShader);
BrightnessContrast.enabled = false;
composer.addPass(BrightnessContrast);

//Vignette
const VignettePass = new ShaderPass(VignetteShader);
VignettePass.enabled = false;
composer.addPass(VignettePass);

//Noise
const Noise = new FilmPass();
console.log(Noise);
Noise.enabled = false;
composer.addPass(Noise);

//abberation
const RGBShiftPass = new ShaderPass(RGBShiftShader);
RGBShiftPass.enabled = false;
composer.addPass(RGBShiftPass);
console.log(RGBShiftPass);

let params = {
  pixelSize: 6,
  normalEdgeStrength: 0.3,
  depthEdgeStrength: 0.4,
  pixelAlignedPanning: true,
  hue: 0,
  saturation: 0,
  brightness: 0,
  contrast: 0,
  darkness: 0,
  offset: 0,
  noise: 0.5,
  focus: 0,
  blur: 0,
  aperture: 0,
  aspect: 0,
  depth: 0,
  offset_: 0,
  angle: 0,
};

const fxaaPass = new ShaderPass(FXAAShader);
const pixelRatio = renderer.getPixelRatio();
fxaaPass.material.uniforms["resolution"].value.x =
  1 / (window.innerWidth * pixelRatio);
fxaaPass.material.uniforms["resolution"].value.y =
  1 / (window.innerHeight * pixelRatio);

const gui = new GUI();

const bloomFolder = gui.addFolder("bloom");
bloomFolder.add(bloomPass, "enabled").name("Bloom");
bloomFolder.add(bloomPass, "strength").min(0.0).max(3.0).name("Intensity");
bloomFolder.add(bloomPass, "radius").min(0.0).max(1.0).name("Blur Scale");
bloomFolder.add(bloomPass, "threshold").min(0.0).max(1.0).name("Threshold");
bloomFolder
  .add(bloomPass.highPassUniforms["smoothWidth"], "value")
  .min(0.0)
  .max(1.0)
  .name("Smoothing");

const PixelationFolder = gui.addFolder("pixelation");
PixelationFolder.add(renderPixelatedPass, "enabled").name("Pixelation");
PixelationFolder.add(params, "pixelSize")
  .min(1)
  .max(64)
  .step(1)
  .onChange(() => {
    renderPixelatedPass.setPixelSize(params.pixelSize);
  });

const hueFolder = gui.addFolder("Hue");
hueFolder.add(HueSaturationPass, "enabled").name("Hue");
hueFolder.add(params, "hue", 0, 6, 0.01).onChange(() => {
  HueSaturationPass.uniforms["hue"].value = params.hue;
});
hueFolder.add(params, "saturation", -1, 1, 0.01).onChange(() => {
  HueSaturationPass.uniforms["saturation"].value = params.saturation;
});

const BrightnessFolder = gui.addFolder("Brightness");
BrightnessFolder.add(BrightnessContrast, "enabled").name(
  "Brightness & Contrast"
);
BrightnessFolder.add(params, "brightness", -1, 1, 0.01).onChange((value) => {
  BrightnessContrast.uniforms["brightness"].value = value;
});
BrightnessFolder.add(params, "contrast", -1, 1, 0.01).onChange((value) => {
  BrightnessContrast.uniforms["contrast"].value = value;
});

const VignetteFolder = gui.addFolder("Vignette");
VignetteFolder.add(VignettePass, "enabled").name("Vignette");
VignetteFolder.add(params, "darkness", 0, 20, 0.01).onChange(() => {
  VignettePass.uniforms["darkness"].value = params.darkness;
});
VignetteFolder.add(params, "offset", 0, 5, 0.01).onChange(() => {
  VignettePass.uniforms["offset"].value = params.offset;
});

const NoiseFolder = gui.addFolder("Noise");
NoiseFolder.add(Noise, "enabled").name("Noise");
NoiseFolder.add(params, "noise", 0, 2, 0.01).onChange(() => {
  Noise.uniforms["intensity"].value = params.noise;
});

Dof.uniforms["nearClip"].value = 0.1;
const DofFolder = gui.addFolder("Dof");
DofFolder.add(Dof, "enabled").name("DoF");
DofFolder.add(params, "focus", 0, 50, 0.01).onChange(() => {
  Dof.uniforms["focus"].value = params.focus;
  console.log(Dof);
});

DofFolder.add(params, "blur", 0, 0.05, 0.001).onChange(() => {
  Dof.uniforms["maxblur"].value = params.blur;
  console.log(Dof);
});
DofFolder.add(params, "aperture", 0, 0.004, 0.0001).onChange(() => {
  Dof.uniforms["aperture"].value = params.aperture;
  console.log(Dof);
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
});

const RGBShiftFolder = gui.addFolder("Abberation");
RGBShiftFolder.add(RGBShiftPass, "enabled").name("Abberation");
RGBShiftFolder.add(params, "offset_", 0, 0.01, 0.0001).onChange(() => {
  RGBShiftPass.uniforms["amount"].value = params.offset_;
});
RGBShiftFolder.add(params, "angle", 0, 6, 0.01).onChange(() => {
  RGBShiftPass.uniforms["angle"].value = params.angle;
});

composer.addPass(fxaaPass);
console.log(fxaaPass);
const effect3 = new OutputPass();
// composer.addPass(effect3);

const TAA = new TAARenderPass(scene, camera);
TAA.sampleLevel = 2;
// composer.addPass(TAA)

composer.addPass(Dof);

function animate() {
  // renderer.render(scene, camera)
  composer.render();
  controls.update();
  requestAnimationFrame(animate);
}
animate();
