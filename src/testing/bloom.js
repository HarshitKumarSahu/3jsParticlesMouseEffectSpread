import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import fragment from "../../shaders/fragment.glsl";
import vertex from "../../shaders/vertexParticle.glsl";

import * as dat from "dat.gui";
import gsap from "gsap";

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';

import {
    EffectComposer,
    RenderPass,
    EffectPass,
    BloomEffect,
    ChromaticAberrationEffect,
    GodRaysEffect,
    VignetteEffect,
    KernelSize
} from "postprocessing";

class Sketch {
    constructor(options) {
        this.scene = new THREE.Scene();

        this.container = options.dom;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setClearColor("#111", 1);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(
            70,
            this.width / this.height,
            100,
            1000
        );
        this.camera.position.set(0, -5, 350);

        this.time = 0;
        this.isPlaying = true;
        this.isModelLoaded = false;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(0, 0);
        this.intersects = [];
        this.ifClicked = false;

        this.addObjects();
        this.addModel();
        this.setupButton();
        this.resize();
        this.mousefun();
        this.setupResize();
        this.setupPostProcessing(); // Initialize post-processing
    }

    addModel() {
        this.loader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('./draco/');
        this.loader.setDRACOLoader(this.dracoLoader);

        let that = this;
        this.loader.load(
            "/models/beyonce.glb",
            function(gltf) {
                const model = gltf.scene;
                
                let geo = new THREE.BufferGeometry();
                let pos = model.children[0].geometry.attributes.position.array;

                geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
                geo.computeBoundingBox();

                that.pointsMesh = new THREE.Points(geo, that.material);
                that.scene.add(that.pointsMesh);
                that.isModelLoaded = true;
                that.render();
            },
            undefined,
            function(e) {
                console.error("Model loading error:", e);
            }
        );
    }

    addObjects() {
        this.material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            uniforms: {
                time: { type: "f", value: 0 },
                mousePos: { type: "v3", value: new THREE.Vector3(0, 0, 0) },
                isMouseOver: { type: "f", value: 0.0 },
                progress: { type: "f", value: 0.0 },
                resolution: { type: "v4", value: new THREE.Vector4() },
                uvRate1: { value: new THREE.Vector2(1, 1) },
            },
            vertexShader: vertex,
            fragmentShader: fragment,
        });

        this.geometry = new THREE.PlaneGeometry(200, 410);
        this.plainMaterial = new THREE.MeshBasicMaterial({
            color: "red", 
            wireframe: true, 
            visible: false
        });
        this.plain = new THREE.Mesh(this.geometry, this.plainMaterial);
        this.scene.add(this.plain);
    }

    setupButton() {
        this.stickButton = document.querySelector('#stickButton');
        this.audio = document.getElementById('effectAudio');
        let that = this;
        this.stickButton.addEventListener('click', () => {
            gsap.to(this.material.uniforms.progress, {
                value: 1.0,
                duration: 2,
                ease: "power2.inOut",
            });
            this.ifClicked = true;
        });
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        if (this.composer) {
            this.composer.setSize(this.width, this.height);
        }
    }

    stop() {
        this.isPlaying = false;
    }

    play() {
        if (!this.isPlaying && this.isModelLoaded) {
            this.render();
            this.isPlaying = true;
        }
    }

    mousefun() {
        let that = this;
        function onMouseMove(event) {
            that.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            that.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }
        
        function onTouchMove(event) {
            event.preventDefault();
            if (event.touches.length > 0) {
                that.mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
                that.mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        }
        
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove);
    }

    setupPostProcessing() {
        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);

        // Bloom Effect
        this.bloomEffect = new BloomEffect({
            intensity: 0.8,
            kernelSize: KernelSize.MEDIUM,
            luminanceThreshold: 0.8,
            luminanceSmoothing: 0.1,
        });
        this.effectPass = new EffectPass(this.camera, this.bloomEffect);
        this.composer.addPass(this.effectPass);
    }

    render() {
        if (!this.isPlaying || !this.isModelLoaded) return;
        this.time += 0.01;

        if (this.pointsMesh && this.ifClicked) {
            this.pointsMesh.rotation.y += 0.00375;
        }
        this.material.uniforms.time.value = this.time;
       
        this.raycaster.setFromCamera(this.mouse, this.camera);
        this.intersects = this.raycaster.intersectObjects([this.plain]);
        if (this.intersects.length > 0) {
            this.material.uniforms.mousePos.value = this.intersects[0].point;
            this.material.uniforms.isMouseOver.value = 1.0;
        } else {
            this.material.uniforms.mousePos.value = new THREE.Vector3(0, 0, 0);
            this.material.uniforms.isMouseOver.value = 0.0;
        }
     
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
        requestAnimationFrame(this.render.bind(this));
    }
}

new Sketch({
    dom: document.querySelector(".canvas"),
});